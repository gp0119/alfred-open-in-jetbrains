"use strict";
import alfy from "alfy";
import glob from "fast-glob";
import os from "os";
import * as path from "path";
import Fuse from "fuse.js";

const query = alfy.input;
const keyword = process.env.alfred_workflow_keyword || "ws";

// const dirs = "~zcckj,~/study";
// const exclude = "~/learn/learn-ts/**";
//
// const workingDirs = getFloderPathByString(dirs);x
// const excludeDirs = getFloderPathByString(exclude);

const workingDirs = getFloderPathByString(process.env.dirs || "");
const excludeDirs = getFloderPathByString(process.env.exclude || "");

function getFloderPathByString(str) {
	return str.split(",").map((floderPath) => {
		const trimmed = floderPath.trim();
		return trimmed.startsWith("~")
			? path.join(os.homedir(), trimmed.slice(1))
			: trimmed;
	});
}

function getWorkingDirs(dirs, exclude) {
	return dirs
		.map((wd) => {
			return glob.sync(wd, {
				cwd: "/",
				onlyDirectories: true,
				deep: 1,
				ignore: exclude,
			});
		})
		.flat();
}

function updateProjects() {
	const wds = getWorkingDirs(workingDirs, excludeDirs);
	const projects = wds
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
	alfy.cache.set("projects", projects);
	return projects;
}
function generateIconMap() {
	const {
		ws_keyword,
		idea_keyword,
		fleet_keyword,
		go_keyword,
		php_keyword,
		py_keyword,
		rust_keyword,
		clion_keyword,
		rider_keyword,
		vscode_keyword,
	} = process.env;
	const map = {
		[ws_keyword]: "webstorm",
		[idea_keyword]: "idea",
		[fleet_keyword]: "fleet",
		[go_keyword]: "goland",
		[php_keyword]: "phpstorm",
		[py_keyword]: "pycharm",
		[rust_keyword]: "rust",
		[clion_keyword]: "clion",
		[rider_keyword]: "rider",
		[vscode_keyword]: "vscode",
	};
	alfy.cache.set("iconMap", map);
}
function output() {
	const projects = alfy.cache.get("projects") || [];
	const iconMap = alfy.cache.get("iconMap") || {};
	const fuse = new Fuse(projects, {
		threshold: 0.4,
		keys: ["name"],
	});
	let matches = projects;
	if (query) {
		matches = fuse.search(query).map((item) => item.item);
	}
	const items = matches.map((item) => {
		const absolutePath = path.join(item.wd, item.name);
		return {
			uid: absolutePath,
			title: item.name,
			subtitle: absolutePath,
			arg: absolutePath,
			icon: {
				path: `./${iconMap[keyword]}.png`,
			},
		};
	});
	alfy.output(items, { rerunInterval: 1 });
	updateProjects();
	generateIconMap();
}

output();
