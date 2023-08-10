"use strict";
// import alfy from "alfy";
import glob from "fast-glob";
import os from "os";
import * as path from "path";

// const workingDirs = process.env.dirs
// 	.split(",")
// 	.map((p) => (p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p));

const dirs = "~/learn/, ~/learn/*";
const exclude = "~/learn/learn-ts/**";

const workingDirs = getFloderPathByString(dirs);
const excludeDirs = getFloderPathByString(exclude);

function getFloderPathByString(str) {
	return str.split(",").map((floderPath) => {
		const trimmed = floderPath.trim();
		return trimmed.startsWith("~")
			? path.join(os.homedir(), trimmed.slice(1))
			: trimmed;
	});
}

console.log("workingDirs: ", workingDirs);

function getWorkingDirs() {
	return workingDirs
		.map((wd) => {
			return glob.sync(wd, {
				cwd: "/",
				onlyDirectories: true,
				deep: 1,
				ignore: excludeDirs,
			});
		})
		.flat();
}

console.log(getWorkingDirs());

// function getProjects() {
// 	return wds
// 		.map((wd) =>
// 			glob.sync("*", {
// 				cwd: wd,
// 				onlyDirectories: true,
// 				deep: 1,
// 				absolute: true,
// 			}),
// 		)
// 		.flat();
// }

function updateProjects() {
	const workingDirs = getWorkingDirs();
	return workingDirs
		.map((wd) => {
			const names = glob.sync("*", {
				cwd: wd,
				onlyDirectories: true,
				deep: 1,
			});
			return {
				wd,
				names,
			};
		})
		.reduce(
			(all, curWd) => [
				...all,
				...curWd.names.map((name) => ({
					name,
					wd: curWd.wd,
				})),
			],
			[],
		);
}

console.log(updateProjects());

// const projects = getProjects();
// console.log("projects: ", projects);

// alfy.output([
// 	{
// 		title: "Open Alfred Preferences",
// 	},
// ]);
