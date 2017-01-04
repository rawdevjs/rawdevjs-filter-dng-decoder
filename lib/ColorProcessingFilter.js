'use strict'

const assign = require('lodash/assign')
const ColorMath = require('rawdevjs-math-color')
const DngMath = require('./Math')
const MatrixMath = require('rawdevjs-math-matrix')

class ColorProcessingFilter {
  constructor (options) {
    this.label = 'DNG color processing'
    this.inPlace = true
    this.dirty = true

    this.cameraToWorkingColorspaceMatrix = new MatrixMath.Matrix3()
    this.toTargetColorspaceMatrix = ColorMath.matrixProPhotoRgb2XYZ.multiply(ColorMath.matrixXYZ2SRgb)
    this.processColor = this._processColor.bind(this)

    assign(this, options)
  }

  process (image) {
    this.image = image

    this.cameraNeutralWhiteBalance = DngMath.cameraNeutralWhiteBalance(this.image.properties)

    let whiteBalance = this.whiteBalance || this.cameraNeutralWhiteBalance

    this.cameraToWorkingColorspaceMatrix = ColorMath.matrixXYZ2ProPhotoRgb.multiply(DngMath.cameraToXYZD50Matrix(this.image.properties, whiteBalance))

    return Promise.resolve(image)
  }

  _processColor (x, y, z) {
    let vector = (new MatrixMath.Vector3([x, y, z])).multiply(this.cameraToWorkingColorspaceMatrix)

    vector = vector.multiply(this.toTargetColorspaceMatrix)

    let sRgbGamma = function (x) {
      return x < 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1.0 / 2.4) - 0.055
    }

    vector.data[0] = sRgbGamma(vector.data[0])
    vector.data[1] = sRgbGamma(vector.data[1])
    vector.data[2] = sRgbGamma(vector.data[2])

    return {
      x: vector.data[0],
      y: vector.data[1],
      z: vector.data[2]
    }
  }
}

module.exports = ColorProcessingFilter
