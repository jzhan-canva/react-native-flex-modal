import React, { PropTypes } from 'react';
import { View, Modal, TouchableWithoutFeedback, Animated, Easing, PanResponder, Dimensions } from 'react-native';

export default class MyModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      backOpacity: new Animated.Value(0),
      isFinished: true,
      easingValue: new Animated.Value(0),
      pan: new Animated.ValueXY(),
      dropPosition: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0
      }
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.tapped = this.tapped.bind(this);
    this.onPanResponderRelease = this.onPanResponderRelease.bind(this);
    this.backPressed = this.backPressed.bind(this);
    this.onPanResponderMove = this.onPanResponderMove.bind(this);
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) this.open();
    if (!nextProps.isOpen && this.props.isOpen) this.close();
  }
  onPanResponderMove(evt, state) {
    if (!this.state.isFinished) return;
    const output = {};
    if (this.props.swipeRangeX[0] !== null && state.dx < this.props.swipeRangeX[0])output.dx = this.props.swipeRangeX[0];
    else if (this.props.swipeRangeX[1] !== null && state.dx > this.props.swipeRangeX[1])output.dx = this.props.swipeRangeX[1];
    else output.dx = state.dx;

    if (this.props.swipeRangeY[0] !== null && state.dy < this.props.swipeRangeY[0])output.dy = this.props.swipeRangeY[0];
    else if (this.props.swipeRangeY[1] !== null && state.dy > this.props.swipeRangeY[1])output.dy = this.props.swipeRangeY[1];
    else output.dy = state.dy;

    Animated.event([null, {
      dx: this.state.pan.x,
      dy: this.state.pan.y
    }])(evt, output);
  }
  onPanResponderRelease(evt, state) {
    if (!this.state.isFinished) return;
    const output = {};
    if (this.props.swipeRangeX[0] !== null && state.dx < this.props.swipeRangeX[0])output.dx = this.props.swipeRangeX[0];
    else if (this.props.swipeRangeX[1] !== null && state.dx > this.props.swipeRangeX[1])output.dx = this.props.swipeRangeX[1];
    else output.dx = state.dx;

    if (this.props.swipeRangeY[0] !== null && state.dy < this.props.swipeRangeY[0])output.dy = this.props.swipeRangeY[0];
    else if (this.props.swipeRangeY[1] !== null && state.dy > this.props.swipeRangeY[1])output.dy = this.props.swipeRangeY[1];
    else output.dy = state.dy;

    const xOutside = ((output.dx <= this.props.swipeThresholdX[0]) && this.props.swipeThresholdX[0] !== null) || ((output.dx >= this.props.swipeThresholdX[1]) && this.props.swipeThresholdX[1] !== null);
    const yOutside = ((output.dy <= this.props.swipeThresholdY[0]) && this.props.swipeThresholdY[0] !== null) || ((output.dy >= this.props.swipeThresholdY[1]) && this.props.swipeThresholdY[1] !== null);
    if (xOutside || yOutside) {
      this.setState({
        dropPosition: {
          x: output.dx,
          y: output.dy,
          vx: state.vx,
          vy: state.vy
        }
      }, () => { this.close(); });
    }
    Animated.timing(
      this.state.pan,
      {
        toValue: {
          x: 0,
          y: 0
        },
      }
    ).start();
  }

  open() {
    if (!this.state.isFinished || this.state.isOpen) return;
    this.setState({
      isOpen: true,
      isFinished: false
    }, () => {
      Animated.timing(
        this.state.backOpacity,
        {
          toValue: 1,
          duration: this.props.timeIn,
        }
      ).start();
      this.state.pan.setValue({
        x: this.props.positionXIn,
        y: this.props.positionYIn
      });
      Animated.timing(
        this.state.pan,
        {
          toValue: {
            x: 0,
            y: 0
          },
          easing: Easing.ease,
          duration: this.props.timeIn,
        }
      ).start();
      Animated.timing(
        this.state.easingValue,
        {
          toValue: 1,
          easing: Easing.ease,
          duration: this.props.timeIn,
        }
      ).start(() => {
        this.setState({ isFinished: true }, () => {
          if (this.props.onOpen) this.props.onOpen();
        });
      });
    });
  }

  backPressed() {
    if (this.props.backToClose) this.close();
  }

  close() {
    if (!this.state.isFinished || !this.state.isOpen) return;
    this.setState({ isFinished: false });
    Animated.timing(
    this.state.backOpacity,
      {
        toValue: 0,
        duration: this.props.timeOut === null ? this.props.timeIn : this.props.timeOut,
      }
    ).start();
    const duration = this.props.timeOut === null ? this.props.timeIn : this.props.timeOut;
    const positionXOut = this.props.positionXOut === null ? this.props.positionXIn : this.props.positionXOut;
    const positionYOut = this.props.positionYOut === null ? this.props.positionYIn : this.props.positionYOut;
    if ((this.state.dropPosition.x === 0 && this.state.dropPosition.y === 0) || !this.props.inertia) {
      Animated.timing(
        this.state.pan,
        {
          toValue: {
            x: positionXOut,
            y: positionYOut
          },
          easing: Easing.ease,
          duration: duration,
        }
      ).start();
    } else {
      const windowWidth = Dimensions.get('window').width;
      const windowHeight = Dimensions.get('window').height;
      let toY;
      let toX;
      if (Math.abs(this.state.dropPosition.y / this.state.dropPosition.x) > windowHeight / windowWidth) {
        toY = this.state.dropPosition.y > 0 ? windowHeight : -windowHeight;
        toX = (windowHeight / Math.abs(this.state.dropPosition.y)) * this.state.dropPosition.x;
      } else {
        toX = this.state.dropPosition.x > 0 ? windowWidth : -windowWidth;
        toY = (windowWidth / Math.abs(this.state.dropPosition.x)) * this.state.dropPosition.y;
      }
      const toValue = {
        toValue: {
          x: toX,
          y: toY
        },
        duration: duration,
      };
      Animated.spring(
        this.state.pan,
        toValue
      ).start();
    }

    Animated.timing(
      this.state.easingValue,
      {
        toValue: 2,
        easing: Easing.ease,
        duration: this.props.timeOut === null ? this.props.timeIn : this.props.timeOut,
      }
    ).start(() => {
      this.setState({
        isOpen: false,
        isFinished: true,
        dropPosition: {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0
        }
      });
      this.state.pan.setValue({
        x: 0,
        y: 0
      });
      this.state.easingValue.setValue(0);

      if (this.props.onCloes) this.props.onCloes();
    });
  }

  tapped() {
    if (this.props.tapToClose) this.close();
  }

  render() {
    const positionX = (this.props.positionX <= 1 && this.props.positionX >= 0) ? this.props.positionX : 0.5;
    const positionY = (this.props.positionY <= 1 && this.props.positionY >= 0) ? this.props.positionY : 0.5;
    const backgroundColor = this.state.backOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 0, 0, 0)', `rgba(0, 0, 0, ${this.props.backOpacity})`]
    });
    const scale = this.state.easingValue.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [this.props.scaleIn, 1, this.props.scaleOut === null ? this.props.scaleIn : this.props.scaleOut]
    });
    const opacity = this.state.easingValue.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [this.props.fadeIn ? 0 : 1, 1, (this.props.fadeOut === null ? this.props.fadeIn : this.props.fadeOut) ? 0 : 1]
    });
    return (
      <Modal
        animationType={'none'}
        transparent={true}
        visible={this.state.isOpen}
        onRequestClose={this.backPressed}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: backgroundColor
          }}
        >
          <TouchableWithoutFeedback
            onPress={this.tapped}
          >
            <View style={{ flex: positionY }} />
          </TouchableWithoutFeedback>
          <View style={{ flexDirection: 'row' }}>
            <TouchableWithoutFeedback
              onPress={this.tapped}
            >
              <View style={{ flex: positionX }} />
            </TouchableWithoutFeedback>
            <Animated.View
              {...(this.props.swipeable ? this.state.panResponder.panHandlers : null)}
              style={[{
                opacity: opacity,
                transform: [{ translateY: this.state.pan.y }, { translateX: this.state.pan.x }, { scale: scale }],
                backgroundColor: 'white'
              }, this.props.containerSytle]}
            >
              {
                this.props.children
              }
            </Animated.View>
            <TouchableWithoutFeedback
              onPress={this.tapped}
            >
              <View style={{ flex: 1 - positionX }} />
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback
            onPress={this.tapped}
          >
            <View style={{ flex: 1 - positionY }} />
          </TouchableWithoutFeedback>
        </Animated.View>
      </Modal>
    );
  }
}

MyModal.propTypes = {
  onCloes: PropTypes.func,
  onOpen: PropTypes.func,
  children: PropTypes.node,
  positionX: PropTypes.number,
  positionY: PropTypes.number,
  backOpacity: PropTypes.number,
  timeIn: PropTypes.number,
  timeOut: PropTypes.number,
  fadeIn: PropTypes.bool,
  fadeOut: PropTypes.bool,
  scaleIn: PropTypes.number,
  scaleOut: PropTypes.number,
  positionXIn: PropTypes.number,
  positionXOut: PropTypes.number,
  positionYIn: PropTypes.number,
  positionYOut: PropTypes.number,
  tapToClose: PropTypes.bool,
  backToClose: PropTypes.bool,
  swipeable: PropTypes.bool,
  swipeRangeX: PropTypes.array,
  swipeRangeY: PropTypes.array,
  swipeThresholdX: PropTypes.array,
  swipeThresholdY: PropTypes.array,
  inertia: PropTypes.bool,
  containerSytle: PropTypes.object,
  isOpen: PropTypes.bool,
};
MyModal.defaultProps = {
  backOpacity: 0.5,
  timeIn: 300,
  timeOut: null,
  fadeIn: false,
  fadeOut: null,
  positionXIn: 0,
  positionYIn: 0,
  positionXOut: null,
  positionYOut: null,
  scaleIn: 1,
  scaleOut: null,
  tapToClose: true,
  swipeable: false,
  swipeRangeX: [null, null],
  swipeRangeY: [null, null],
  swipeThresholdX: [-50, 50],
  swipeThresholdY: [-50, 50],
  inertia: true,
  backToClose: true
};
