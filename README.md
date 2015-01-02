# BoqBot | boq_TV's Twitch Chat Bot

## Introduction

boq_TV is a professional CS:GO shoutcaster and analyst currently working for goRGNtv.  He streams frequently on [his Twitch channel.](http://twitch.tv/boq_TV/)

This bot aims to facilitate the chat and perform tasks for boq and his moderators.

## Features

* Tracks viewers and the amount of time they spend watching. (!viewers, !viewerlist debug commands)
* Records chat messages.
* Tracks donations. (!donation)
* Determine the amount of time a streamer has been streaming. (!uptime)

## Upcoming Features

* Give moderators the ability to highlight a specific part of the stream for boq to go back and upload to Youtube. (!highlight, !recap)
* Give each viewer a rank based on viewership, chat participation, and donations.
* Assist in giveaways by automatically checking if a viewer is following @Boq_TV.
* Allow users to add songs to a specified Spotify(tm) playlist. (!addsong)
* Invite random viewers to play CS:GO with boq. (!invite)
* Can create strawpolls, provide a link to the strawpoll, and periodically update chat with results.
* Host a channel for a specified amount of time.
* Check if Nightbot is in chat, force it to join if it's not.

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