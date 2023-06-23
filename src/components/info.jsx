/* global chrome */

import React, { Component } from 'react';
import axios from 'axios';


const ChannelBio = ({ channelBio, maxLength }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderBio = () => {
    if (channelBio.length <= maxLength || isExpanded) {
      return channelBio;
    } else {
      return (
        <React.Fragment>
          {channelBio.slice(0, maxLength)}
          <span onClick={toggleExpand} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            {''}
            ...
          </span>
        </React.Fragment>
      );
    }
  };

  return <p>{renderBio()}</p>;
};

class Info extends Component {
  state = {
    isLoading: true,
    channelTitle: '',
    channelImage: '',
    channelBio: '',
    joinedDateText: '',
    videosText: '',
    subscribersText: '',
  };

  componentDidMount() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      console.log('erste URL:', currentUrl);
    });

    this.addURLChangeListeners();
  }

  componentWillUnmount() {
    this.removeURLChangeListeners();
    console.log('hallo');
  }

  addURLChangeListeners() {
    window.addEventListener('hashchange', this.handleURLChange);
    window.addEventListener('popstate', this.handleURLChange);
  }

  removeURLChangeListeners() {
    window.removeEventListener('hashchange', this.handleURLChange);
    window.removeEventListener('popstate', this.handleURLChange);
  }

  handleURLChange = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      console.log('zweite URL:', currentUrl);
    });
  };



  loadVideo = async (videoID) => {
    const options = {
      method: 'GET',
      url: 'https://youtube138.p.rapidapi.com/video/details/',
      params: {
        id: videoID,
      },
      headers: {
        'X-RapidAPI-Key': '25ffaed0e3msh993fc2e72b8d207p15c6f9jsna8933ec26b3a',
        'X-RapidAPI-Host': 'youtube138.p.rapidapi.com'
      }
    };

    try {
      const response = await axios(options);
      console.log('erstes Console log', response.data)
     this.loadChannel(response.data.author.channelId)
      
    } catch (error) {
      console.error(error);
    }
  };
  
  loadChannel = async (ChannelID) => {
    const options = {
        method: 'GET',
        url: 'https://youtube138.p.rapidapi.com/channel/details/',
        params: {
          id: ChannelID,
        },
        headers: {
          'X-RapidAPI-Key': '25ffaed0e3msh993fc2e72b8d207p15c6f9jsna8933ec26b3a',
          'X-RapidAPI-Host': 'youtube138.p.rapidapi.com'
        }
      };
  
      try {
        const response = await axios(options);
        console.log('zweites Console log', response.data)
        this.setState({
          channelTitle: response.data.title,
          channelImage: response.data.avatar[1].url,
          channelBio: response.data.description,
          joinedDateText: response.data.joinedDate,
          videosText: response.data.stats.videos,
          subscribersText: response.data.stats.subscribers,
          isLoading: false,
        })
        
      } catch (error) {
        console.error(error);
      }}


      render() {
    const {isLoading, channelTitle, channelImage,channelBio,joinedDateText, videosText, subscribersText } = this.state;
    
    if (isLoading) {
      return <p className='loading'>Lade Informationen...</p>; // Anzeige, während die Informationen geladen werden
    }


    return (
      <div>
      <div className='header'>
        <h2>Kanalname: {channelTitle}</h2>
        <img src={channelImage} alt='' />
      </div>
      <ChannelBio channelBio={channelBio} maxLength={200} /> {/* Begrenze auf 100 Zeichen */}
      <p>{channelTitle} ist seit dem {joinedDateText} auf Youtube, hat seitdem {videosText} Videos
        hochgeladen und {subscribersText} Abos erreicht.</p>
        <button> hallo</button>
    </div>
    );
  }
}

export default Info;
