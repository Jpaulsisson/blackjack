import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [deck, setDeck] = useState([]);
  const [freshDeck, setFreshDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState({ player: 'player', cards: [] });
  const [dealerHand, setDealerHand] = useState({ player: 'dealer', cards: [] });
  const [playerBank, setPlayerBank] = useState(10000);
  const [bet, setBet] = useState(0);
  const [finalBet, setFinalBet] = useState(0);
  const [stayStatus, setStayStatus] = useState(false);

  useEffect(() => {
    getDeck();
  }, []);

  useEffect(() => {
    const amount = finalBet;
    setPlayerBank((prev) => prev - amount);
  }, [finalBet]);

  
  useEffect(() => {
    if (calcScore(playerHand) === 'BUSTED') {
      setStayStatus(true);
      setFinalBet(0);
    }

    if (playerHand.cards.length === 2 && calcScore(playerHand) === 21) {
      stay(dealerHand, playerHand)
    }
  })

  const getDeck = async () => {
    const newDeckID = await fetch('https://deckofcardsapi.com/api/deck/new/')
      .then((response) =>
        response.ok
          ? response.json()
          : alert('something must be wrong with the API')
      )
      .then((jsonResponse) => jsonResponse);
    const deckID = newDeckID.deck_id;

    const cards = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`
    )
      .then((response) =>
        response.ok
          ? response.json()
          : alert('something must be wrong with the API')
      )
      .then((jsonResponse) => jsonResponse);
    const newDeck = Array.from(cards.cards);

    const shuffledDeck = shuffle(newDeck);

    setFreshDeck(shuffledDeck);
    setDeck(shuffledDeck);
    return;
  };

  const shuffle = (freshDeck) => {
    const shuffled = [...freshDeck];
    for (let i = 0; i < freshDeck.length; i++) {
      let random = Math.floor(Math.random() * 51);
      let temp;
      temp = shuffled[i];
      shuffled[i] = shuffled[random];
      shuffled[random] = temp;
    }
    return shuffled;
  };

  const dealCard = (deck, hand) => {
    const copyDeck = deck.slice();
    const card = copyDeck.shift();

    switch (hand.player) {
      case 'player':
        setPlayerHand((prev) => ({
          player: 'player',
          cards: [...prev.cards, card],
        }));
        break;
      case 'dealer':
        setDealerHand((prev) => ({
          player: 'dealer',
          cards: [...prev.cards, card],
        }));
        break;
    }
    setDeck(copyDeck);
  };

  const deal = () => {
    setStayStatus(false);
    const starterDeck = [...freshDeck];
    const playerFirstCard = starterDeck.shift();
    const dealerFirstCard = starterDeck.shift();
    const playerSecondCard = starterDeck.shift();
    const dealerSecondCard = starterDeck.shift();

    const newFreshDeck = shuffle([...freshDeck]);

    setPlayerHand({
      player: 'player',
      cards: [playerFirstCard, playerSecondCard],
    });
    setDealerHand({
      player: 'dealer',
      cards: [dealerFirstCard, dealerSecondCard],
    });
    setFreshDeck(newFreshDeck);
    setDeck(starterDeck);
  };

  const autoDeal = (deck, dealerHand) => {
    const starterDeck = [...deck];
    const fakeHand = dealerHand;
    while (calcScore(fakeHand) < 17 && calcScore(fakeHand) !== 'BUSTED') {
      const nextCard = starterDeck.shift();
      fakeHand.cards.push(nextCard);
    }
    setDealerHand({ ...fakeHand });
    return;
  };

  const reduceToScore = (hand) => {
    const currentScore = hand.cards.reduce((total, card) => {
      let trueValue;
      switch (card.value) {
        case 'ACE':
          trueValue = 11;
          break;
        case '2':
          trueValue = 2;
          break;
        case '3':
          trueValue = 3;
          break;
        case '4':
          trueValue = 4;
          break;
        case '5':
          trueValue = 5;
          break;
        case '6':
          trueValue = 6;
          break;
        case '7':
          trueValue = 7;
          break;
        case '8':
          trueValue = 8;
          break;
        case '9':
          trueValue = 9;
          break;
        case '10':
        case 'JACK':
        case 'QUEEN':
        case 'KING':
          trueValue = 10;
          break;
        default:
          'error';
          return trueValue;
      }

      return total + trueValue;
    }, 0);
    return currentScore;
  };

  const checkForAce = (hand) => {
    const currentScore = hand.cards.reduce((total, card) => {
      let trueValue;
      switch (card.value) {
        case 'ACE':
          trueValue = 1;
          break;
        case '2':
          trueValue = 2;
          break;
        case '3':
          trueValue = 3;
          break;
        case '4':
          trueValue = 4;
          break;
        case '5':
          trueValue = 5;
          break;
        case '6':
          trueValue = 6;
          break;
        case '7':
          trueValue = 7;
          break;
        case '8':
          trueValue = 8;
          break;
        case '9':
          trueValue = 9;
          break;
        case '10':
        case 'JACK':
        case 'QUEEN':
        case 'KING':
          trueValue = 10;
          break;
        default:
          'error';
          return trueValue;
      }

      return total + trueValue;
    }, 0);
    return currentScore;
  };

  const calcScore = (hand) => {
    if (hand) {
      const currentScore = reduceToScore(hand);
      if (currentScore > 21) {
        const finalScore = checkForAce(hand);
        if (finalScore > 21) {
          const busted = 'BUSTED';
          return busted;
        } else {
          return finalScore;
        }
      }
    }
    const currentScore = reduceToScore(hand);
    return currentScore;
  };

  const calcHiddenScore = (dealerHand) => {
    const hiddenScoreTarget = dealerHand.cards[1];
    let trueValue;
    switch (hiddenScoreTarget.value) {
      case 'ACE':
        trueValue = 11;
        break;
      case '2':
        trueValue = 2;
        break;
      case '3':
        trueValue = 3;
        break;
      case '4':
        trueValue = 4;
        break;
      case '5':
        trueValue = 5;
        break;
      case '6':
        trueValue = 6;
        break;
      case '7':
        trueValue = 7;
        break;
      case '8':
        trueValue = 8;
        break;
      case '9':
        trueValue = 9;
        break;
      case '10':
      case 'JACK':
      case 'QUEEN':
      case 'KING':
        trueValue = 10;
        break;
      default:
        'error';
    }
    return trueValue;
  };

  const evaluateScore = (dealerHand, playerHand) => {
    const dealerScore = calcScore(dealerHand);
    const playerScore = calcScore(playerHand);
    let winner;

    switch (true) {
      case dealerScore === 'BUSTED':
        winner = 'player';
        break;
      case playerScore === 'BUSTED':
        winner = 'dealer';
        break;
      case dealerScore > playerScore:
        winner = 'dealer';
        break;
      case dealerScore < playerScore && playerScore === 21:
        winner = 'blackjack';
        break;
      case dealerScore < playerScore:
        winner = 'player';
        break;
      case dealerScore == playerScore:
        winner = 'draw';
        break;
      default:
        'something went wrong';
        return winner;
    }
    return winner;
  };

  const handleBetInput = (e) => {
    const amount = parseInt(e.target.value); 
    setBet(amount);
  };

  const handleFinalBet = (e) => {
    e.preventDefault();
    setPlayerHand({ player: 'player', cards: [] });
    setDealerHand({ player: 'dealer', cards: [] });
    setStayStatus(false);
    setFinalBet(bet);
  };

  const playerBlackjack = (finalBet, playerBank) => {
    const newBankAmount = (finalBet * 3) / 2 + finalBet + playerBank;
    setPlayerBank(newBankAmount);
    setFinalBet(0);
  };

  const playerWin = (finalBet, playerBank) => {
    const newBankAmount = finalBet + finalBet + playerBank;
    setPlayerBank(newBankAmount);
    setFinalBet(0);
  };

  const playerDraw = (finalBet, playerBank) => {
    const newBankAmount = finalBet + playerBank;
    setPlayerBank(newBankAmount);
    setFinalBet(0);
  };

  const stay = (dealerHand, playerHand) => {
    setStayStatus(true);
    const dealerScore = calcScore(dealerHand);

    if (dealerScore < 17) {
      autoDeal(deck, dealerHand);
    }

    const winner = evaluateScore(dealerHand, playerHand);

    switch (winner) {
      case 'blackjack':
        playerBlackjack(finalBet, playerBank);
        break;
      case 'player':
        playerWin(finalBet, playerBank);
        break;
      case 'dealer':
        setFinalBet(0);
        break;
      case 'draw':
        playerDraw(finalBet, playerBank);
        break;
      default:
        'You broke it. Thanks';
    }
    return;
  };

  const betCheck = bet > playerBank;
  const handCheck = playerHand.cards.length === 0;
  const broke = finalBet === 0 && playerBank === 0;
  const disableDeal = finalBet > 0 && playerHand.cards.length > 0;

  return (
    <>
      {broke
        ? (
        <h1 className="title-broke">
          <span className="title-span">💔 </span>You are BROKE, Jack <span className="title-span">😞</span>
        </h1>
        
        ) : (
          <h1 className='title'>
            <span className="title-span">♦️ ♣️</span> Blackjack <span className="title-span">♠️ ♥️</span>
          </h1>
        )}
      
      <div className="buttons-and-bank-container">
        <div className="player-bank-container">
          <h2 className="player-bank">{`$${playerBank}`}</h2>
          <form className="bet-input-form">
            <input
              disabled={finalBet > 0}
              min="0"
              max={playerBank}
              onChange={handleBetInput}
              type="number"
              step={100}
              placeholder="Bet..."
              className="bet-input"
            />
            <button
              disabled={betCheck || finalBet > 0}
              onClick={handleFinalBet}
              type="submit"
              className="bet-button"
            >
              Bet
            </button>
          </form>
          <span className="current-bet">
            Current bet: $<span className="current-bet-amount">{finalBet}</span>
          </span>
        </div>
        <div className="button-container">
          <button
            disabled={finalBet === 0 || handCheck || calcScore(playerHand) === 'BUSTED'}
            className="hit-btn"
            onClick={() => dealCard(deck, playerHand)}
          >
            Hit
          </button>
          <button
            disabled={finalBet === 0 || handCheck || calcScore(playerHand) === 'BUSTED'}
            className="stay-btn"
            onClick={() => stay(dealerHand, playerHand)}
          >
            Stay
          </button>
          <button
            disabled={finalBet === 0 || disableDeal}
            className="deal-btn"
            onClick={() => deal()}
          >
            Deal
          </button>
        </div>
      </div>

      {stayStatus
        ? dealerHand && (
            <div className="hand">
              {dealerHand.cards.map((card) => (
                <img
                  className="cards"
                  key={card.code}
                  src={`${card.images.png}`}
                />
              ))}
            </div>
          )
        : dealerHand.cards.length > 0 && (
            <div className="hand">
              <div className='card-backface'></div>
              <img
                className="cards"
                src={`${dealerHand.cards[1].images.png}`}
              />
            </div>
          )}
      {stayStatus ? (
        <h2 className="score">
          {calcScore(dealerHand) > 0 || calcScore(dealerHand) === 'BUSTED'
            ? `Dealer Score: ${calcScore(dealerHand)}`
            : 'Enter a bet and'}
        </h2>
      ) : (
        <h2 className="score">
          {calcScore(dealerHand) > 0 || calcScore(dealerHand) === 'BUSTED'
            ? `Dealer Showing: ${calcHiddenScore(dealerHand)}`
            : 'Enter a bet and'}
        </h2>
      )}

      <div className="hand">
        {playerHand &&
          playerHand.cards.map((card) => (
            <img className="cards" key={card.code} src={`${card.images.png}`} />
          ))}
      </div>
      <h2 className="score">
        {calcScore(playerHand) > 0 || calcScore(playerHand) === 'BUSTED'
          ? `Player Score: ${calcScore(playerHand)}`
          : 'click deal to Start'}
      </h2>
    </>
  );
}

export default App;
