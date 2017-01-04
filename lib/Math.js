'use strict'

const ColorMath = require('rawdevjs-math-color')
const MatrixMath = require('rawdevjs-math-matrix')

class DngMath {
  static matrixInterpolation (matrix1, matrix2, value1, value2, value) {
    if (!matrix1 && !matrix2) {
      return null
    } else if (matrix1 && !matrix2) {
      return matrix1
    } else if (value < value1) {
      return matrix1
    } else if (value > value2) {
      return matrix2
    } else {
      let f = ((1.0 / value) - (1.0 / value2)) / ((1.0 / value1) - (1.0 / value2))
      let f1 = 1.0 - f
      let matrix = new MatrixMath.Matrix3()

      for (let i = 0; i < 9; i++) {
        matrix.data[i] = matrix1.data[i] * f + matrix2.data[i] * f1
      }

      return matrix
    }
  }

  static xyzToCamera (tags, whiteBalanceXY) {
    let whiteBalanceTemperature = ColorMath.temperatureFromXY(whiteBalanceXY)
    let colorMatrix = DngMath.matrixInterpolation(tags.colorMatrix1, tags.colorMatrix2, tags.calibrationIlluminant1, tags.calibrationIlluminant2, whiteBalanceTemperature.temperature)
    // let reductionMatrix = DngMath.matrixInterpolation(tags.reductionMatrix1, tags.reductionMatrix2, tags.calibrationIlluminant1, tags.calibrationIlluminant2, whiteBalanceTemperature.temperature)
    let cameraCalibration = DngMath.matrixInterpolation(tags.cameraCalibration1, tags.cameraCalibration2, tags.calibrationIlluminant1, tags.calibrationIlluminant2, whiteBalanceTemperature.temperature)
    cameraCalibration = cameraCalibration || new MatrixMath.Matrix3()
    let analogBalance = tags.analogBalance ? tags.analogBalance.toMatrix3() : new MatrixMath.Matrix3()

    return analogBalance.multiply(cameraCalibration.multiply(colorMatrix))
  }

  static cameraToXYZD50Matrix (tags, whiteBalanceXY) {
    let whiteBalanceXYZ = ColorMath.xyToXyz(whiteBalanceXY)
    let xyzToCamera = DngMath.xyzToCamera(tags, whiteBalanceXY)
    let cameraToXYZ = xyzToCamera.inverse()
    let chromaticAdaptation = ColorMath.whitePointXYZConvertMatrix(whiteBalanceXYZ, ColorMath.xyToXyz(ColorMath.whitePointD50))
    let cameraToXYZD50 = chromaticAdaptation.multiply(cameraToXYZ)

    return cameraToXYZD50
  }

  static cameraNeutralWhiteBalance (tags, neutralWhiteBalance) {
    neutralWhiteBalance = neutralWhiteBalance || tags.asShotNeutral

    let last = ColorMath.whitePointD50
    let d = 1.0

    do {
      let current = ColorMath.vectorToXY(neutralWhiteBalance.multiply(DngMath.xyzToCamera(tags, last).inverse()))
      d = Math.abs(last.x - current.x) + Math.abs(last.y - current.y)
      last = current
    } while (d > 0.0000001)

    return last
  }
}

module.exports = DngMath
