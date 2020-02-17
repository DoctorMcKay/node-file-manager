declare module 'file-manager' {
	import * as Events from "events";

	type BufferLike = Buffer|string|number;

	interface IFiles {
		[Key:string]: BufferLike
	}

	interface ReadedFile {
		filename: string,
		contents: string
	}

	type ReadEventCallbackParameter = (err?: Error, content?: string) => void;
	type ReadEventListener = (filename: string, callback: ReadEventCallbackParameter) => void;

	type SaveEventCallbackParameter = (err?: Error) => void;
	type SaveEventListener = (filename: string, contents: string, callback: SaveEventCallbackParameter) => void;


	export default class FileManager extends Events.EventEmitter {
		public directory: string;

		constructor(storageDirectory: string | null);

		/**
		 * Returns true if either a storage directory is set, or if save and read handlers have been registered.
		 */
		isEnabled(): boolean;

		/**
		 * Saves a file. Returns a Promise that will be fulfilled once the file is saved, or rejected if there's an error.
		 * @param fileName Obvious
		 * @param contents Either a Buffer, or some other value that will have .toString() called on it, then it will be converted to a Buffer by interpreting the string as UTF-8
		 */
		saveFile(fileName: string, contents: BufferLike): Promise<void>;

		/**
		 * Saves a file. Returns a Promise that will be fulfilled once the file is saved, or rejected if there's an error.
		 * @param fileName Obvious
		 * @param contents Either a Buffer, or some other value that will have .toString() called on it, then it will be converted to a Buffer by interpreting the string as UTF-8
		 */
		writeFile(fileName: string, contents: BufferLike): Promise<void>;

		/**
		 * Saves many files
		 * @param files Keys are filenames, values are Buffer objects containing the file contents
		 */
		saveFiles(files: IFiles): Promise<void>;

		/**
		 * Saves many files
		 * @param files Keys are filenames, values are Buffer objects containing the file contents
		 */
		writeFiles(files: IFiles): Promise<void>;

		/**
		 * Reads the contents of a single file
		 * @param fileName The name of the file to read
		 */
		readFile(fileName: string): Promise<string>;

		/**
		 * Reads the contents of multiple files
		 * @param fileNames An array of filenames
		 * @returns Promise<ReadedFile[]> Array with same order as input array, each element is an object with filename and contents properties.
		 */
		readFiles(fileNames: string[]): Promise<ReadedFile[]>;

		/**
		 * Listens the read event.
		 * @param event Event name to track
		 * @param listener Listener of the event
		 */
		on(event: 'read', listener: ReadEventListener): this;

		/**
		 * Listens the save event.
		 * @param event Event name to track
		 * @param listener Listener of the event
		 */
		on(event: 'save', listener: SaveEventListener): this;
	}
}
