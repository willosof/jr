#!/bin/bash

DEBUG=*,-config,-engine*,-socket.io*,-express*,-send node --inspect index.js $*
