import React, { Component, PropTypes } from 'react';
/* Styles */
import styles from './styles/'

const DISPLAY_NAME = '<DroppableStack>';

class DroppableStack extends Component {
  constructor(props) {
    super(props);
    let ownFuncs = [ "checkGoodDrop", "handleStackDrop", "handleAceDrop",
                     "handleMouseDown",
                     "getCardColor", "getCardValue", "getCardSuit" ]
    ownFuncs.forEach((elem) => {
      if (!this[elem]) {
        console.error(`Attempt to self-bind \'${elem}\' to ${DISPLAY_NAME} failed`);
        return;
      }
      this[elem] = this[elem].bind(this);
    })

    this.width = 75;
  }
  
  getCardSuit(card) {
    let { name } = card;
    let suit = name.substr(name.lastIndexOf('-') + 1);
    return suit;

  }
  getCardColor(card) {
    let { name } = card;
    let suit = name.substr(name.lastIndexOf('-') + 1);
    switch (suit) {
      case 'hearts':
      case 'diamonds':
        return 'red';
      case 'spades':
      case 'clubs':
        return 'black';

      default:
        return 'blank';
    }
  }
  getCardValue(card) {
    let { name } = card;
    let value = name.substr(0, name.indexOf('-'))
    //console.log(`Getting Card Value of ${name}: ${value}`);
    switch (value) {
      case 'ace': return 1;
      case 'two': return 2;
      case 'three': return 3;
      case 'four': return 4;
      case 'five': return 5;
      case 'six': return 6;
      case 'seven': return 7;
      case 'eight': return 8;
      case 'nine': return 9;
      case 'ten': return 10;
      case 'jack': return 11;
      case 'queen': return 12;
      case 'king': return 13;

      default: return -1;
    }
  }
  handleAceDrop(card) {
    let { name } = card;
    let numChildren = this.props.children.length;
    let cardValue = this.getCardValue(card);
    let cardSuit = this.getCardSuit(card);

    console.log(`!ACE DROP! Value of ${name} = ${cardValue} and ${cardSuit}`);
    if (cardValue === (numChildren + 1)) {
      if (numChildren > 0) {
        let firstChild = this.props.children[0];
        let stackSuit = this.getCardSuit({name: firstChild.props.name});
        return (stackSuit === cardSuit)
      } else {
        return (cardValue === 1);
      }
    }

    return false;
  }
  handleStackDrop(card) {
    let { name } = card;
    let numChildren = this.props.children.length;
    let cardValue = this.getCardValue(card);
    let cardColor = this.getCardColor(card);

    console.log(`!STACK DROP! Value of ${name} = ${cardValue} and ${cardColor}`);
    if (numChildren > 0) {
      let { children } = this.props;
      let lastChild = children[children.length - 1];
      let stackCard = {name: lastChild.props.name};
      let stackValue = this.getCardValue(stackCard);
      let stackColor = this.getCardColor(stackCard);

      return ((stackColor !== cardColor) && (stackValue === (cardValue + 1)))
    } else {
      return (cardValue === 13)
    }
  }
  checkGoodDrop(card) {
    // This is called when there is a drop on this droppable from <Table>
    // return true to accept the drop, false to rejct it
    let { stackName } = this.props;
    if (stackName.indexOf('ACE') >= 0) {
      return this.handleAceDrop(card);
    }
    if (stackName.indexOf('STACK') >= 0) {
      return this.handleStackDrop(card);
    }
  }
  componentWillReceiveProps(nextProps) {
    // When receiving new props, if the facing card is face down,
    // then flip it over
    let { children: newChildren } = nextProps;
    let { children: oldChildren } = this.props;
    
    if ((newChildren.length > 0) && (newChildren.length < oldChildren.length)) {
      let lastChild = 'child-' + (newChildren.length-1);
      let child = this.refs[lastChild];
      if (child && child.isFlipped()) {
        let { stackName } = this.props;
        console.log(`Flipping on: ${stackName}`);
        child.flip();
      }
    }

  }

  handleMouseDown(e, childIndex) {
    let { children } = this.props;
    let stackBelowClicked = [];
    for (let index = childIndex, len = children.length; index < len; ++index) {
      let refName = 'child-' + index;
      stackBelowClicked.push(this.refs[refName]);
    }
    stackBelowClicked.forEach((elem) => {
      console.log(`Below Clicked: ${elem.props.name}`);
    });
    let clickedChild = stackBelowClicked[0];
    if (clickedChild)
      clickedChild.handleMouseDown(e);
  }
  render() {
    let { offsetLeft = 0, index = 1 } = this.props;
    index -= 1; 
    let offset = (index === 0) ?
                   offsetLeft : 
                   offsetLeft + index * (this.width + this.props.distance);
    let cardIndex = 0;
    let children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        onMouseDown: ((index) => { return (e) => this.handleMouseDown(e, index) })(cardIndex),
        ref: 'child-' + (cardIndex++)
      });
    });
    return (
      <div className={'droppable ' + styles}
           style={{left: offset + "px"}} >
        {children}
      </div>
    )
  }

}

DroppableStack.propTypes = {
  stackName: PropTypes.string.isRequired,
  index: PropTypes.number,
  distance: PropTypes.number,
  offsetLeft: PropTypes.number
}
export default DroppableStack;
