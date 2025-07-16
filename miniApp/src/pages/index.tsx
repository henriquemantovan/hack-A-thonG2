import React from 'react';
import Button from '../components/Button';
import styles from '../styles/Home.module.css';
import router, { useRouter } from 'next/router';

const Home = () => {
  const handleButtonClick1 = () => {
    // Functionality for button 1
    router.push('/novoproduto');
  };

  const handleButtonClick2 = () => {
    // Functionality for button 2
  };

  return (
    <div className={styles.container}>
      <h1 className="text-2xl font-bold font-mono text-gray-800 text-center">Welcome to the Mini App</h1>
      <Button label="Cadastrar novo produto" onClick={handleButtonClick1} />
      <Button label="Button 2" onClick={handleButtonClick2} />
    </div>
  );
};

export default Home;