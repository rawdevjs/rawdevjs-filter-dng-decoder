'use strict'

const Parser = require('rawdevjs-filter-tiff-decoder/lib/Parser')
const Tags = require('./lib/Tags')

class Filter {
  constructor () {
    this.label = 'DNG decoder'
    this.inPlace = false
    this.dirty = false
  }

  process (data) {
    let rootDirectories = Parser.parse(data)
    let rawDirectory = rootDirectories[0].getDirectoryBySubfileType(0)

    return rawDirectory.readImage().then((image) => {
      image.properties = Tags.parse(rootDirectories[0], rawDirectory)

      return image
    })
  }
}

module.exports = Filter
