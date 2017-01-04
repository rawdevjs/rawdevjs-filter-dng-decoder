'use strict'

const MatrixMath = require('rawdevjs-math-matrix')

class Tags {
  static toDouble (value) {
    if (!value) {
      return value
    }

    if (!isNaN(value - 0)) {
      return value
    }

    if ('n' in value && 'd' in value) {
      return value.n / value.d
    }

    return value
  }

  static toDoubleArray (values) {
    if (!values) {
      return null
    }

    let doubleValues = []

    for (let i = 0; i < values.length; i++) {
      doubleValues.push(Tags.toDouble(values[i]))
    }

    return doubleValues
  }

  static getTagProperty (directory, tag) {
    if (!(tag in directory.properties)) {
      return null
    }

    return directory.properties[tag]
  }

  static getTagValue (directory, tag) {
    let property = Tags.getTagProperty(directory, tag)

    if (!property) {
      return property
    }

    return property.value()
  }

  static getTagValues (directory, tag) {
    let property = Tags.getTagProperty(directory, tag)

    if (!property) {
      return property
    }

    return property.values()
  }

  static getStringTagValue (directory, tag) {
    let value = Tags.getTagValue(directory, tag)

    if (value instanceof Uint8Array) {
      let string = ''

      for (let i = 0; i < value.length; i++) {
        string += String.fromCharCode(value[i])
      }

      return string
    } else if (typeof value === 'string') {
      return value
    }

    return null
  }

  static getDoubleTagValue (directory, tag) {
    return Tags.toDouble(Tags.getTagValue(directory, tag))
  }

  static getDoubleTagValues (directory, tag) {
    return Tags.toDoubleArray(Tags.getTagValues(directory, tag))
  }

  static getVectorTagValue (directory, tag) {
    let property = Tags.getTagProperty(directory, tag)

    if (!property) {
      return property
    }

    let values = Tags.toDoubleArray(property.values())

    if (values.length === 3) {
      return new MatrixMath.Vector3(values)
    }

    return null
  }

  static getMatrixTagValue (directory, tag) {
    let property = Tags.getTagProperty(directory, tag)

    if (!property) {
      return property
    }

    let values = Tags.toDoubleArray(property.values())

    if (values.length === 3 || values.length === 9) {
      return new MatrixMath.Matrix3(values)
    } else if (values.length === 4 || values.length === 12 || values.length === 16) {
      return new MatrixMath.Matrix4(values)
    }

    return null
  }

  static exifLightSourceTemperature (lightSource) {
    if (lightSource & 0x8000) {
      return lightSource & 0x7fff
    }

    switch (lightSource) {
      case 1:
      case 4:
      case 9:
      case 18:
      case 20:
        return 5500.0

      case 2:
      case 14:
        return 4200.0

      case 3:
      case 17:
        return 2850.0

      case 10:
      case 19:
      case 21:
        return 6500.0

      case 11:
      case 22:
        return 7500.0

      case 12:
        return 6400.0

      case 13:
      case 23:
        return 5000.0

      case 15:
        return 3450.0

      case 24:
        return 3200.0

      default:
        return 0.0
    }
  }

  static parse () {
    let tags = {}

    let directory = arguments[0]

    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i].properties) {
        directory.properties[key] = arguments[i].properties[key]
      }
    }

    // TIFF-EP
    tags.cfaRepeatPatternDim = Tags.getTagValues(directory, 0x828d)
    tags.cfaPattern = Tags.getTagValue(directory, 0x828e)

    // DNG
    tags.dngVersion = Tags.getTagValue(directory, 0xc612)
    tags.dngBackwardVersion = Tags.getTagValue(directory, 0xc613)
    tags.uniqueCameraModel = Tags.getStringTagValue(directory, 0xc614)
    tags.localizedCameraModel = Tags.getStringTagValue(directory, 0xc615)
    tags.cfaPlaneColor = Tags.getTagValue(directory, 0xc616)
    tags.cfaLayout = Tags.getTagValue(directory, 0xc617)
    tags.linearizationTable = Tags.getTagValues(directory, 0xc618)
    tags.blackLevelRepeatDim = Tags.getTagValues(directory, 0xc619)
    tags.blackLevel = Tags.getDoubleTagValues(directory, 0xc61a)
    tags.blackLevelDeltaH = Tags.getDoubleTagValues(directory, 0xc61b)
    tags.blackLevelDeltaV = Tags.getDoubleTagValues(directory, 0xc61c)
    tags.whiteLevel = Tags.getTagValue(directory, 0xc61d)
    tags.defaultScale = Tags.getDoubleTagValues(directory, 0xc61e)
    tags.bestQualityScale = Tags.getDoubleTagValue(directory, 0xc65c)
    tags.defaultCropOrigin = Tags.getDoubleTagValues(directory, 0xc61f)
    tags.defaultCropSize = Tags.getDoubleTagValues(directory, 0xc620)
    tags.calibrationIlluminant1 = Tags.exifLightSourceTemperature(Tags.getTagValue(directory, 0xc65a))
    tags.calibrationIlluminant2 = Tags.exifLightSourceTemperature(Tags.getTagValue(directory, 0xc65b))
    tags.colorMatrix1 = Tags.getMatrixTagValue(directory, 0xC621)
    tags.colorMatrix2 = Tags.getMatrixTagValue(directory, 0xC622)
    tags.cameraCalibration1 = Tags.getMatrixTagValue(directory, 0xc623)
    tags.cameraCalibration2 = Tags.getMatrixTagValue(directory, 0xc624)
    tags.reductionMatrix1 = Tags.getMatrixTagValue(directory, 0xc625)
    tags.reductionMatrix2 = Tags.getMatrixTagValue(directory, 0xc626)
    tags.analogBalance = Tags.getVectorTagValue(directory, 0xc627)
    tags.asShotNeutral = Tags.getVectorTagValue(directory, 0xc628)
    let asShotWhiteXyArray = Tags.getTagValues(directory, 0xc629)
    tags.asShotWhiteXy = asShotWhiteXyArray != null ? {x: asShotWhiteXyArray[0], y: asShotWhiteXyArray[1]} : null
    tags.baselineExposure = Tags.getDoubleTagValue(directory, 0xc62a)
    tags.baselineNoise = Tags.getDoubleTagValue(directory, 0xc62b)
    tags.baselineSharpness = Tags.getDoubleTagValue(directory, 0xc62c)
    tags.bayerGreenSplit = Tags.getTagValue(directory, 0xc62d)
    tags.linearResponseLimit = Tags.getDoubleTagValue(directory, 0xc62e)
    tags.cameraSerialNumber = Tags.getStringTagValue(directory, 0xc62f)
    tags.lensInfo = Tags.getDoubleTagValues(directory, 0xc630)
    tags.chromaBlurRadius = Tags.getDoubleTagValue(directory, 0xc631)
    tags.antiAliasStrength = Tags.getDoubleTagValue(directory, 0xc632)
    tags.shadowScale = Tags.getDoubleTagValue(directory, 0xc633)
    tags.dngPrivateData = Tags.getTagValue(directory, 0xc634)
    tags.makerNoteSafety = Tags.getTagValue(directory, 0xc635)
    tags.rawDataUniqueID = Tags.getTagValue(directory, 0xc65d)
    tags.originalRawFileName = Tags.getStringTagValue(directory, 0xc65d)
    tags.originalRawFileData = Tags.getTagValue(directory, 0xc68c)
    tags.activeArea = Tags.getTagValues(directory, 0xc68d)
    tags.maskedAreas = Tags.getTagValues(directory, 0xc68e)
    tags.asShotICCProfile = Tags.getTagValue(directory, 0xc68f)
    tags.asShotPreProfileMatrix = Tags.getMatrixTagValue(directory, 0xc690)
    tags.currentICCProfile = Tags.getTagValue(directory, 0xc691)
    tags.currentPreProfileMatrix = Tags.getMatrixTagValue(directory, 0xc692)
    tags.colorimetricReference = Tags.getTagValue(directory, 0xc6bf)
    tags.cameraCalibrationSignature = Tags.getStringTagValue(directory, 0xc6f3)
    tags.profileCalibrationSignature = Tags.getStringTagValue(directory, 0xc6f4)
    tags.extraCameraProfiles = Tags.getTagValues(directory, 0xc6f5)
    tags.asShotProfileName = Tags.getStringTagValue(directory, 0xc6f6)
    tags.noiseReductionApplied = Tags.getDoubleTagValue(directory, 0xc6f7)
    tags.profileName = Tags.getStringTagValue(directory, 0xc6f8)
    tags.profileHueSatMapDims = Tags.getTagValues(directory, 0xc6f9)
    tags.profileHueSatMapData1 = Tags.getDoubleTagValues(directory, 0xc6fa)
    tags.profileHueSatMapData2 = Tags.getDoubleTagValues(directory, 0xc6fb)
    tags.profileToneCurve = Tags.getDoubleTagValues(directory, 0xc6fc)
    tags.profileEmbedPolicy = Tags.getTagValue(directory, 0xc6fd)
    tags.profileCopyright = Tags.getStringTagValue(directory, 0xc6fe)
    tags.forwardMatrix1 = Tags.getMatrixTagValue(directory, 0xc714)
    tags.forwardMatrix2 = Tags.getMatrixTagValue(directory, 0xc715)
    tags.previewApplicationName = Tags.getStringTagValue(directory, 0xc716)
    tags.previewApplicationVersion = Tags.getStringTagValue(directory, 0xc717)
    tags.previewSettingsName = Tags.getStringTagValue(directory, 0xc718)
    tags.previewSettingsDigest = Tags.getTagValue(directory, 0xc719)
    tags.previewColorSpace = Tags.getTagValue(directory, 0xc71a)
    tags.previewDateTime = Tags.getStringTagValue(directory, 0xc71b)
    tags.rawImageDigest = Tags.getTagValue(directory, 0xc71c)
    tags.originalRawFileDigest = Tags.getTagValue(directory, 0xc71d)
    tags.subTileBlockSize = Tags.getTagValues(directory, 0xc71e)
    tags.rowInterleaveFactor = Tags.getTagValue(directory, 0xc71f)
    tags.profileLookTableDims = Tags.getTagValues(directory, 0xc725)
    tags.profileLookTableData = Tags.getDoubleTagValues(directory, 0xc726)
    tags.opcodeList1 = Tags.getTagValue(directory, 0xc740)
    tags.opcodeList2 = Tags.getTagValue(directory, 0xc741)
    tags.opcodeList3 = Tags.getTagValue(directory, 0xc74e)
    tags.noiseProfile = Tags.getDoubleTagValues(directory, 0xc761)

    return tags
  }
}

module.exports = Tags
