# BoqBot | boq_TV's Twitch Chat Bot

## Introduction

boq_TV is a professional CS:GO shoutcaster and analyst currently working for goRGNtv.  He streams frequently on [his Twitch channel.](http://twitch.tv/boq_TV/)

This bot aims to facilitate the chat and perform tasks for boq and his moderators. A secondary goal is to be structured in such a way that other Twitch broadcasters could easily set it up for themselves with little to no programming experience.

## Features

* Tracks viewers and the amount of time they spend watching. (!viewers, !viewerlist debug commands)
* Records chat messages.
* Tracks donations. (!donation)
* Determine the amount of time a streamer has been streaming. (!uptime)
* Give moderators the ability to highlight a specific part of the stream for the broadcaster to go back and upload to Youtube. (!highlight, !recap)
* Allow users to add songs to a specified Spotify(tm) playlist. (!addsong)

## Upcoming Features

* Give each viewer a rank based on viewership, chat participation, and donations.
* Assist in giveaways by automatically checking if a viewer is following @Boq_TV.
* Invite random viewers to play CS:GO with boq. (!invite)
* Create strawpolls, provide a link to the strawpoll, and periodically update chat with results.
* Host a channel for a specified amount of time.
* Check if Nightbot is in chat, force it to join if it's not.
* Fully featured !help documentation for each command.

## Dependencies

MongoDB

    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org

Node.js

    curl -sL https://deb.nodesource.com/setup | sudo bash -
    sudo apt-get install -y nodejs

Node-IRC and Mongoose
    
    sudo npm install irc
    sudo npm install mongoose

Spotify Web API

    sudo npm install restler
    sudo npm install promise
    sudo npm install spotify-web-api-node