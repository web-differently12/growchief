<p align="center">
  <a href="https://growchief.com/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/1ba8233b-856e-448e-899b-5f9445e65d85">
    <img alt="GrowChief Logo" src="https://github.com/user-attachments/assets/50401d55-d870-478a-a5c4-ef6b474e6ccc" width="280"/>
  </picture>
  </a>
</p>

<p align="center">
<a href="https://opensource.org/license/agpl-v3">
  <img src="https://img.shields.io/badge/License-AGPL%203.0-blue.svg" alt="License">
</a>
</p>

<div align="center">
  <strong>
  <h2>Your ultimate social media automation tool (outreach tool)</h2><br />
  <a href="https://growchief.com">GrowChief</a>: An alternative to: Phantom Buster, Expandi, Zopto, LinkedIn Helper, Meet Alfred, etc.<br /><br />
  </strong>
  GrowChief is an API based tool to automate your social media accounts such as<br />sending connection requests and follow-up messages. Perfect for n8n / Make / Zapier users
</div>

<div class="flex" align="center">
  <br />
  <img alt="Linkedin" src="https://postiz.com/svgs/socials/Linkedin.svg" width="32">
  <img alt="X" src="https://postiz.com/svgs/socials/X.svg" width="32">
</div>
<p align="center">
  <br />
  <a href="https://docs.growchief.com" rel="dofollow"><strong>Explore the docs »</strong></a>
  <br />
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/n8n-nodes-growchief">N8N node</a>
  ·
  <a href="https://platform.growchief.com">Register</a>
  ·
  <a href="https://discord.growchief.com">Join Our Discord (devs only)</a>
</p>

## ✨ Features

| ![Image 1](https://github.com/user-attachments/assets/492ffc23-98ff-4d1b-a812-34debc0d2161) | ![Image 2](https://github.com/user-attachments/assets/1dd33597-dc87-45a7-8380-f31c102c3687) |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ![Image 3](https://github.com/user-attachments/assets/ba7d377a-8ede-424e-9c5e-6f7741d97f81) | ![Image 4](https://github.com/user-attachments/assets/17e903c8-b32c-4f6c-b565-dc30f240f069) |

---

## Introduction

Growchief is an open-source social media automation tool (aka social scraper). It allows you to create a workflow (step-by-step) for interacting with different accounts on social media, such as sending a connection request, following up with a message, and so on.
We do not encourage spam (perfect for API/n8n automations).

## Why is GrowChief so good?

* It takes care of concurrency — even if you create 10 workflows with the same account and trigger all of them at the same time, it will make an action every 10 minutes, never having multiple scrapings happening at the same time.

* Enrichment waterful — when you don't provide the account URL but other parameters like email, we use multiple provider to figure out the profile URL.

* It takes care of your working hours — you can use the API to keep adding leads to your workflows, but they will only be processed during working hours.

* Proxies are allowed — you can add your own proxies or create one using proxy providers to keep you safe.

* Human-like automation — GrowChief uses natural mouse movements and clicks on different parts of the screen. It never triggers clicks by `"document.querySelector('x').click()"`.

* It uses [Playwright](https://github.com/microsoft/playwright) together with [Patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright) for maximum stealthiness.

* It uses a special technology to authenticate your accounts — you never need to put your username and password directly into the system.

* It always runs in headful — our Docker image is already built with `xvfb` for real human automation.

## Things you should know

* Social media automation is a common practice in businesses, from small ones to enterprises. Yes, even the biggest companies in the world do it.
  However, it violates the terms of service of the platforms and can result in a ban. Use it at your own risk and connect only with leads you know.

* GrowChief Docker can work great without scale, as every time you start automation it opens a Chrome browser (perfect for 1–2 accounts).
  However, once you scale, you need a smarter system (remote browser) with an option to scale, as Chrome consumes a lot of memory. For that, you can use GrowChief Cloud.


## Tech Stack

* PNPM (Monorepo)
* React (Vite)
* NestJS (Backend, Workers)
* Prisma (Default to PostgreSQL)
* Temporal (Orchestrator)

## QuickStart / Installation

View https://docs.growchief.com

## Sponsorship

This can be very valuable for Proxies / Lead enrichment companies, feel free to check our sponsorship page.
