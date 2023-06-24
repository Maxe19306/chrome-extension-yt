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
    noYoutubeVideo: false,
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
    this.handleUrlChange(currentUrl)    
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active && tab.url) {
      const newUrl = changeInfo.url;
      this.handleUrlChange(newUrl)
    }
  })
}

handleUrlChange(url) {
  if (this.isYouTubeUrl(url)) {
    const videoID = this.youtube_parser(url);
    this.loadVideo(videoID);
  } else {
    this.setState({
      noYoutubeVideo: true
    });
  }
}


  youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  }
  
  
  isYouTubeUrl(url) {
    // Überprüfe, ob die URL zu YouTube gehört
    const youtubeDomain = 'www.youtube.com';
    const urlObj = new URL(url);
    return urlObj.hostname === youtubeDomain;
  }


  loadVideo = async (videoID) => {
    
    const options = {
      method: 'GET',
      url: 'https://youtube138.p.rapidapi.com/video/details/',
      params: {
        id: videoID,
      },
      headers: {
        'X-RapidAPI-Key': '09ec3d1b95msh9c398ceb6f5d1b0p1ec3cfjsn0e2d038dd1e3',
        'X-RapidAPI-Host': 'youtube138.p.rapidapi.com'
      }
    };

    try {
      const response = await axios(options);
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
          'X-RapidAPI-Key': '09ec3d1b95msh9c398ceb6f5d1b0p1ec3cfjsn0e2d038dd1e3',
          'X-RapidAPI-Host': 'youtube138.p.rapidapi.com'
        }
      };
  
      try {
        const response = await axios(options);
        this.handleChannelResponse(response)
        
      } catch (error) {
        console.error(error);
      }}
      
 handleChannelResponse(response){
        this.setState({
          channelTitle: response.data.title,
          channelImage: response.data.avatar[1].url,
          channelBio: response.data.description,
          joinedDateText: response.data.joinedDate,
          videosText: response.data.stats.videos,
          subscribersText: response.data.stats.subscribers,
          isLoading: false,
        })
      }


      render() {
    const {noYoutubeVideo ,isLoading, channelTitle, channelImage,channelBio,joinedDateText, videosText, subscribersText } = this.state;
    
    
    if(noYoutubeVideo){
      return <p>Diese Erweiterung ist nur für Youtube</p> // wird angezeigt, wenn der Nutzer nicht auf Youtube ist.
    }
    
    if (isLoading) {
      return <p className='loading'>Lade Informationen...</p>; // Anzeige, während die Informationen geladen werden
    }


    return (
      <div>
      <div className='header'>
        <h2>Kanalname: {channelTitle}</h2>
        <img src={channelImage} alt='' />
      </div>
      <ChannelBio channelBio={channelBio} maxLength={200} /> {}
      <p>{channelTitle} ist seit dem {joinedDateText} auf Youtube, hat seitdem {videosText} Videos
        hochgeladen und {subscribersText} Abos erreicht.</p>
       
    </div>
    );
  }
}

export default Info;
