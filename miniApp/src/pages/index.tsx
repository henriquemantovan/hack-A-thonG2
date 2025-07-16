import React from 'react';
import Button from '../components/Button';
import styles from '../styles/Home.module.css';

const Home = () => {
  const handleButtonClick1 = () => {
    // Functionality for button 1
  };

  const handleButtonClick2 = () => {
    // Functionality for button 2
  };

  return (
    <div className={styles.container}>
      <h1>Welcome to the Mini App</h1>
      <Button label="Button 1" onClick={handleButtonClick1} />
      <Button label="Button 2" onClick={handleButtonClick2} />
    </div>
  );
};

export default Home;