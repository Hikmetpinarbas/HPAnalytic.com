// Local, file-based Studio state.
//
// Lives OUTSIDE the repository (default ~/HPA_EDITORIAL_STUDIO, override with
// HP_EDITORIAL_ROOT). Internal corpus, drafts and notes therefore never enter
// git, the public build, the client bundle or page source. One JSON file per
// topic keeps diffs readable and lets Termux tools (jq, grep) work on it.

import { mkdir, readFile, readdir, rename, writeFile, appendFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export function studioRoot(env = process.env) {
  return path.resolve(env.HP_EDITORIAL_ROOT || path.join(os.homedir(), 'HPA_EDITORIAL_STUDIO'));
}

const ID_PATTERN = /^ET-\d{8}-[a-z0-9]{4}$/;
export const isTopicId = (id) => ID_PATTERN.test(String(id ?? ''));

async function writeJsonAtomic(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tmp, file);
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

export function createStore(root = studioRoot()) {
  const topicsDir = path.join(root, 'topics');
  const topicFile = (id) => {
    if (!isTopicId(id)) throw new Error(`INVALID_TOPIC_ID:${id}`);
    return path.join(topicsDir, `${id}.json`);
  };

  return {
    root,

    async listTopics() {
      let names = [];
      try {
        names = await readdir(topicsDir);
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
      const topics = [];
      for (const name of names) {
        if (!name.endsWith('.json')) continue;
        const topic = await readJson(path.join(topicsDir, name), null);
        if (topic?.schema === 'HP_EDITORIAL_TOPIC_V1') topics.push(topic);
      }
      return topics.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    },

    async getTopic(id) {
      if (!isTopicId(id)) return null;
      return readJson(topicFile(id), null);
    },

    async saveTopic(topic) {
      await writeJsonAtomic(topicFile(topic.id), topic);
      return topic;
    },

    async failureMemory() {
      return readJson(path.join(root, 'failure-memory.json'), []);
    },

    async rememberFailure(entry) {
      const list = await this.failureMemory();
      list.push(entry);
      await writeJsonAtomic(path.join(root, 'failure-memory.json'), list);
      return list;
    },

    // Append-only decision log (§42). The Google Docs operations ledger stays the
    // human-facing record; this is the machine-readable trail behind it.
    async log(event) {
      await mkdir(root, { recursive: true });
      await appendFile(path.join(root, 'ledger.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`, 'utf8');
    },

    // Last KONU BUL result (max five suggestions, waiting for accept/dismiss).
    async suggestions() {
      return readJson(path.join(root, 'suggestions.json'), { at: null, suggestions: [] });
    },

    async saveSuggestions(value) {
      await writeJsonAtomic(path.join(root, 'suggestions.json'), value);
    },

    async languageProfile() {
      return readJson(path.join(root, 'profile', 'HP_LANGUAGE_PROFILE.json'), null);
    },

    async writeOutbox(relativePath, content) {
      const target = path.resolve(root, 'outbox', relativePath);
      if (!target.startsWith(path.join(root, 'outbox') + path.sep)) throw new Error('OUTBOX_PATH_ESCAPE');
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content, 'utf8');
      return target;
    },
  };
}
