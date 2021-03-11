import { getInput } from "@actions/core";
import { Octokit } from "@octokit/rest";
import {
  GetResponseDataTypeFromEndpointMethod,
  OctokitResponse,
} from "@octokit/types";

import { WebhookBody } from "../models";
import { CONCLUSION_THEMES } from "../constants";

const octokit = new Octokit();

export function formatCompactLayout(
  commit: OctokitResponse<
    GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getCommit>
  >,
  conclusion: string,
  elapsedSeconds?: number
) {
  const author = commit.data.author;
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const shortSha = process.env.GITHUB_SHA?.substr(0, 7);
  const runLink = `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const webhookBody = new WebhookBody();

  // Set status and elapsedSeconds
  let labels = `\`${conclusion.toUpperCase()}\``;
  if (elapsedSeconds) {
    labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s]\``;
  }

  // Set environment name
  const environment = getInput("environment");
  if (environment !== "") {
    labels += ` \`ENV:${environment.toUpperCase()}\``;
  }

  // Set themeColor
  webhookBody.themeColor = CONCLUSION_THEMES[conclusion] || "957DAD";

  webhookBody.text =
    `${labels} &nbsp; CI [#${process.env.GITHUB_RUN_NUMBER}](${runLink}) ` +
    `(commit [${shortSha}](${commit.data.html_url})) on [${process.env.GITHUB_REPOSITORY}](${repoUrl}) `;

  if (author) {
    webhookBody.text += ` by [@${author.login}](${author.html_url})`;
  }

  return webhookBody;
}
