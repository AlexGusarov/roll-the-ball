import React from 'react';
import Table from './Table';
import './App.css';

const App = () => {
  return (
    <div className='app-container'>
      <h1 className="heading">Roll the ball</h1>
      <Table width={800} height={400} />
    </div>
  );
}

export default App;
