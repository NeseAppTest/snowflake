/**
 * # Subview.js
 *
 *  Custom View to show Nese Teach Screen Capability
 *
 */
'use strict'
/*
 * ## Imports
 *
 * Imports from redux
 */
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

/**
 * Router
 */
import {Actions} from 'react-native-router-flux'

/**
 * Navigation Bar
 */
import NavigationBar from 'react-native-navbar'

/**
 * Imports for the Component
 */
// import Video from 'react-native-video'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'react-native-fetch-blob'
import firebase from 'firebase'
import Camera from 'react-native-camera'

/**
 * The necessary components from React
 */
import React from 'react'
import
{
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
  ActivityIndicator
}
from 'react-native'

/**
 * Use device options so we can reference the Version
 *
 */
import * as deviceActions from '../reducers/device/deviceActions'

/**
* ## Redux boilerplate
*/

/**
 *  Instead of including all app states via ...state
 *  You probably want to explicitly enumerate only those which Main.js will depend on.
 *
 */
function mapStateToProps (state) {
  return {
    deviceVersion: state.device.version
  }
}

/*
 * Bind all the actions in deviceActions
 */
function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(deviceActions, dispatch)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  typeButton: {
    padding: 5,
  },
  flashButton: {
    padding: 5,
  },
  buttonsSpace: {
    width: 10,
  },
})
/**
 * ### Translations
 */
var I18n = require('react-native-i18n')
import Translations from '../lib/Translations'
I18n.translations = Translations


/**
 * ## Upload constants and functions
 */

// Firebase Config Requirements
const config = {
  apiKey: "AIzaSyCRb2XdP0OtDFVN9kgJhzmsv5da3xNXRs4",
  authDomain: "nesetrial.firebaseapp.com",
  databaseURL: "https://nesetrial.firebaseio.com",
  storageBucket: "nesetrial.appspot.com",
  messagingSenderId: "131793820327"
}
firebase.initializeApp(config)
const storage = firebase.storage()

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const uploadImage = (uri) => {
  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
    const sessionId = new Date().getTime()
    let uploadBlob = null
    const imageRef = storage.ref('images').child(`${sessionId}`)

    let rnfbURI = RNFetchBlob.wrap(uploadUri)
    console.log('this is the rnfbURI build object')
    console.log(rnfbURI)

    Blob
      .build(rnfbURI, { type : 'video/mp4;'})
      .then((blob) => {
        console.log('this is the blob object')
        console.log(blob)
        uploadBlob = blob
        return imageRef.put(blob, { contentType: 'video/mp4' })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
    })
  })
}

/**
 * ## Subview class
 */
class Subview extends React.Component{

  constructor(props) {
    super(props)

    this.camera = null

    this.state = {
      camera: {
        aspect: Camera.constants.Aspect.fill,
        captureTarget: Camera.constants.CaptureTarget.cameraRoll,
        type: Camera.constants.Type.back,
        orientation: Camera.constants.Orientation.auto,
        flashMode: Camera.constants.FlashMode.auto,
        captureAudio: true
      },
      isRecording: false
    }

    //this.takePicture = this.takePicture.bind(this)
    this.startRecording = this.startRecording.bind(this)
    this.stopRecording = this.stopRecording.bind(this)
    this.switchType = this.switchType.bind(this)
    this.switchFlash = this.switchFlash.bind(this)
    this.uploadImage = this.uploadImage.bind(this)
  }

  uploadImage() {
    console.log('this is pickImage button')
    this.setState({ uploadURL: '' })

    const options = {
      mediaType: 'video'
    }

    ImagePicker.launchImageLibrary(options, response  => {
      console.log('this is the response url')
      console.log(response.uri)
      uploadImage(response.uri)
        .then(url => this.setState({ uploadURL: url }))
        .catch(error => console.log(error))
    })
  }
  // this is a camera function that is not needed
  /*
  takePicture() {
    if (this.camera) {
      this.camera.capture()
        .then((data) => console.log(data))
        .catch(err => console.error(err))
    }
  }
  */

  startRecording() {
    if (this.camera) {
      this.camera.capture({mode: Camera.constants.CaptureMode.video})
          .then((data) => console.log(data))
          .catch(err => console.error(err))
      this.setState({
        isRecording: true
      })
    }
  }

  stopRecording() {
    if (this.camera) {
      this.camera.stopCapture()
      this.setState({
        isRecording: false
      })
    }
  }

  switchType() {
    let newType
    const { back, front } = Camera.constants.Type

    if (this.state.camera.type === back) {
      newType = front
    } else if (this.state.camera.type === front) {
      newType = back
    }

    this.setState({
      camera: {
        ...this.state.camera,
        type: newType,
      },
    })
  }

  get typeIcon() {
    let icon
    const { back, front } = Camera.constants.Type

    if (this.state.camera.type === back) {
      icon = require('../images/ic_camera_rear_white.png')
    } else if (this.state.camera.type === front) {
      icon = require('../images/ic_camera_front_white.png')
    }

    return icon
  }

  switchFlash() {
    let newFlashMode
    const { auto, on, off } = Camera.constants.FlashMode

    if (this.state.camera.flashMode === auto) {
      newFlashMode = on
    } else if (this.state.camera.flashMode === on) {
      newFlashMode = off
    } else if (this.state.camera.flashMode === off) {
      newFlashMode = auto
    }

    this.setState({
      camera: {
        ...this.state.camera,
        flashMode: newFlashMode,
      },
    })
  }

  get flashIcon() {
    let icon
    const { auto, on, off } = Camera.constants.FlashMode

    if (this.state.camera.flashMode === auto) {
      icon = require('../images/ic_flash_auto_white.png')
    } else if (this.state.camera.flashMode === on) {
      icon = require('../images/ic_flash_on_white.png')
    } else if (this.state.camera.flashMode === off) {
      icon = require('../images/ic_flash_off_white.png')
    }

    return icon
  }

  render () {
    var titleConfig = {
      title: I18n.t('Subview.subview')
    }

    var leftButtonConfig = {
      title: I18n.t('Subview.back'),
      handler: Actions.pop
    }

    return (
      <View style={{flex:1}}>
        <NavigationBar
          title={titleConfig}
          leftButton={leftButtonConfig} />
        <View style={styles.container}>
          <StatusBar
            animated
            hidden
          />
          <Camera
            ref={(cam) => {
              this.camera = cam
            }}
            style={styles.preview}
            aspect={this.state.camera.aspect}
            captureTarget={this.state.camera.captureTarget}
            captureAudio={this.state.camera.captureAudio}
            type={this.state.camera.type}
            flashMode={this.state.camera.flashMode}
            defaultTouchToFocus
            mirrorImage={false}
          />
          <View style={[styles.overlay, styles.topOverlay]}>
            <TouchableOpacity
              style={styles.typeButton}
              onPress={this.switchType}
            >
              <Image
                source={this.typeIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={this.switchFlash}
            >
              <Image
                source={this.flashIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.overlay, styles.bottomOverlay]}>
            {
              !this.state.isRecording
              &&
              <TouchableOpacity
                  style={styles.captureButton}
                  onPress={this.uploadImage}
              >
                <Image
                    source={require('../images/ic_photo_upload_36pt.png')}
                />
              </TouchableOpacity>
              ||
              null
            }
            <View style={styles.buttonsSpace} />
            {
                !this.state.isRecording
                &&
                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={this.startRecording}
                >
                  <Image
                      source={require('../images/ic_videocam_36pt.png')}
                  />
                </TouchableOpacity>
                ||
                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={this.stopRecording}
                >
                  <Image
                      source={require('../images/ic_stop_36pt.png')}
                  />
                </TouchableOpacity>
            }
          </View>
        </View>
      </View>
    )
  }
}

/**
 * Connect the properties
 */
export default connect(mapStateToProps, mapDispatchToProps)(Subview)
