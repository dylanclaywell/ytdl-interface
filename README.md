# ytdl-interface

This is a Next.js application that provides a graphical user interface for youtube-dl. It provides the basic functionality to queue videos for downloading and select the file format.

## Getting Started

Make sure you have [youtube-dl](https://github.com/ytdl-org/youtube-dl) downloaded and installed before getting started.

Install dependencies

```bash
yarn
```

Run application

```bash
yarn dev
```

## SQL

The database is powered by SQLite, and until I have a better way to do this, the tables first need to be created.

```SQL
CREATE TABLE "videos" (
	"uuid"	TEXT NOT NULL,
	"youtubeId"	TEXT NOT NULL,
	"format"	TEXT NOT NULL,
	"filename"	TEXT NOT NULL,
	"extension"	TEXT NOT NULL,
	"status"	TEXT NOT NULL CHECK(status in("Pending", "Cancelled", "Error", "Complete")),
	PRIMARY KEY("uuid")
);
```

## youtube-dl

The command that is run when a queued video is downloaded is in the following format:

```bash
youtube-dl <id> -f <format> -o <filename>.<extension>
```
