const {EventEmitter} = require('events');
const FS = require('fs');
const Util = require('util');

Util.inherits(FileManager, EventEmitter);
module.exports = FileManager;

/**
 * Creates a new FileManager object
 * @param {string} directory - The local directory where files will be saved if events aren't listened to. No trailing slash. No nesting.
 * @constructor
 */
function FileManager(directory) {
	Object.defineProperty(this, 'directory', {
		"get": function() {
			return this._directory;
		},
		"set": function(newDir) {
			this._directory = newDir;
		}
	});

	this._directory = null;
	this.directory = directory;
}

/**
 * Checks whether or not the FileManager object can store and retrieve files.
 * @returns bool
 */
FileManager.prototype.isEnabled = function() {
	return (this.listeners('save').length > 0 && this.listeners('read').length > 0) || this.directory !== null;
};

/**
 * Saves a file
 * @param {string} filename - The name of the file
 * @param {Buffer|*} contents - The contents of the file
 * @return {Promise}
 */
FileManager.prototype.saveFile = FileManager.prototype.writeFile = function(filename, contents) {
	return new Promise((resolve, reject) => {
		if (!this.isEnabled()) {
			return reject(new Error("File storage system is not enabled"));
		}

		if (!Buffer.isBuffer(contents)) {
			contents = Buffer.from(contents.toString(), 'utf8');
		}

		if (this.listeners('save').length > 0) {
			this.emit('save', filename, contents, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});

			return;
		}

		checkDirExists(this.directory);

		FS.writeFile(this.directory + '/' + filename, contents, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

/**
 * Saves many files
 * @param {Object} files - Keys are filenames, values are Buffer objects containing the file contents
 * @return {Promise}
 */
FileManager.prototype.saveFiles = FileManager.prototype.writeFiles = function(files) {
	return new Promise(async (resolve, reject) => {
		try {
			await Promise.all(Object.keys(files).map(filename => this.saveFile(filename, files[filename])));
			resolve();
		} catch (ex) {
			reject(ex);
		}
	});
};

/**
 * Reads the contents of a single file
 * @param {string} filename - The name of the file to read
 * @return {Promise}
 */
FileManager.prototype.readFile = function(filename) {
	return new Promise((resolve, reject) => {
		if (!this.isEnabled()) {
			return reject(new Error("File storage system is not enabled"));
		}

		if (this.listeners('read').length > 0) {
			this.emit('read', filename, (err, content) => {
				if (err) {
					reject(err);
				} else {
					resolve(content);
				}
			});

			return;
		}

		FS.readFile(this.directory + '/' + filename, (err, content) => {
			if (err) {
				reject(err);
			} else {
				resolve(content);
			}
		});
	});
};

/**
 * Reads the contents of multiple files
 * @param {string[]} filenames - An array of filenames
 * @return {Promise<Array>} - Array with same order as input array, each element is an object with filename and contents properties.
 */
FileManager.prototype.readFiles = function(filenames) {
	return Promise.all(filenames.map((filename) => {
		return new Promise(async (resolve, reject) => {
			try {
				let contents = await this.readFile(filename);
				return resolve({filename, contents});
			} catch (error) {
				resolve({filename, error});
			}
		});
	}));
};

function checkDirExists(dir) {
	if (!dir) {
		return;
	}

	let path = '';
	dir.replace(/\\/g, '/').split('/').forEach(function(dir, index) {
		if (index === 0 && !dir) {
			path = '/';
		} else {
			path += (path ? '/' : '') + dir;
		}

		if (!FS.existsSync(path)) {
			FS.mkdirSync(path, 0o750);
		}
	});
}
