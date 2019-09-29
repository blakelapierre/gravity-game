import { h, render } from 'preact-cycle';

const {
  INIT
} = {
  INIT (_, mutation) {
    _.inited = true;
    _.mutation = mutation;
    
    return _;
  }
};

const INIT_GUI = ({}, {inited, mutation}) => inited ? <GUI /> : mutation(INIT)(mutation);

const GUI = () => (
  <gui>
    gui
  </gui>
);

render(
  INIT_GUI, {
  }, document.body
);
