import React, { useState } from 'react';
import { Grid } from '@mui/material';
import './Intro.css';
import SearchBar from '../components/SearchBar';
import CardComponent from '../components/Card';

const IntroPage = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    console.log(`Searching for: ${searchValue}`);
    //...
  };

  return (
    <div className="intro-container">
      <div className="yellow-container">
        <h1>Ready to go on a quest today?</h1>
        <p>Unlock Your Potential: Improve your reading with exciting games today!</p>
        <img src="/image/coverPhoto.png" alt="Banner" className="header-image" />
        <SearchBar />
      </div>

   
      <div className="green-container">
        {/* Continue Learning  */}
        <div className="column">
          <h2>Continue Learning </h2>
          <Grid container spacing={2}>
            <CardComponent title="Understanding Romantic Gothic" date="10 Nov" progress={75} backgroundColor="#E54B32"link="/startGame" />
            <CardComponent title="Haiku 101" date="10 Nov" progress={80} backgroundColor="#5586E0" link="/startGame"/>
            <CardComponent title="Problem-Solution Essay Writing" date="12 Dec" progress={65} backgroundColor="#5586E0"link="/startGame"  />
            <CardComponent title="English Poetry" date="1 Mar" progress={5} backgroundColor="#E54B32" link="/startGame"/>
            <CardComponent title="English Poetry" date="1 Mar" progress={20} backgroundColor="#5586E0" link="/startGame"/>

          </Grid>
        </div>

        {/* Coming Up */}
        <div className="column">
          <h2>Coming Up</h2>
          <Grid container spacing={2}>
            <CardComponent title="New Years Literature" date="1 Jan" progress={0} backgroundColor="#E54B32" link="/startGame"/>
            <CardComponent title="Math 101" date="14 Feb" progress={50} backgroundColor="#5586E0"link="/startGame" />
            <CardComponent title="English Poetry" date="1 Mar" progress={40} backgroundColor="#E54B32" link="/startGame"/>
            <CardComponent title="Mandarin 101" date="1 Mar" progress={65} backgroundColor="#5586E0"link="/startGame" />

          </Grid>
        </div>

        {/* Featured */}
        <div className="column">
          <h2>Featured</h2>
          <Grid container spacing={2}>
            <CardComponent title="American History" date="Ongoing" progress={90} backgroundColor="#E54B32" link="/startGame"/>
            <CardComponent title="Thai History" date="Ongoing" progress={30} backgroundColor="#E54B32"link="/startGame" />
            <CardComponent title="Taiwanese Food Influence on Books" date="Ongoing" progress={100} backgroundColor="#E54B32" link="/startGame"/>
            <CardComponent title="Old English" date="1 Mar" progress={80} backgroundColor="#5586E0" link="/startGame" />
            <CardComponent title="English Poetry" date="1 Mar" progress={90} backgroundColor="#E54B32" link="/startGame" />
            <CardComponent title="World History" date="1 Mar" progress={10} backgroundColor="#5586E0"  link="/startGame" />

          </Grid>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
