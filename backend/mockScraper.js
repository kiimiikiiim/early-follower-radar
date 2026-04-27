// Mock scraper that generates realistic sample data
// This allows the app to work while we solve the Playwright issue on Railway

const mockFollowers = {
  paulg: ['alice_dev', 'bob_startup', 'charlie_vc', 'diana_tech', 'eve_builder', 'frank_ai', 'grace_web3', 'henry_data'],
  elonmusk: ['alice_dev', 'bob_startup', 'iris_crypto', 'jack_robotics', 'kate_energy', 'leo_space', 'mia_neural'],
  sama: ['alice_dev', 'nancy_llm', 'oscar_ml', 'patricia_nlp', 'quinn_vision', 'rachel_ai', 'steve_transformer'],
  naval: ['alice_dev', 'tina_philosophy', 'uma_crypto', 'victor_bitcoin', 'wendy_defi', 'xavier_web3', 'yara_nft'],
  balajis: ['alice_dev', 'zack_crypto', 'amy_blockchain', 'blake_web3', 'clara_defi', 'david_nft', 'emma_token'],
};

const accountDetails = {
  alice_dev: { followers: 2500, bio: 'Software engineer & startup enthusiast' },
  bob_startup: { followers: 1800, bio: 'Building the next big thing' },
  charlie_vc: { followers: 3200, bio: 'Venture capitalist interested in AI' },
  diana_tech: { followers: 1500, bio: 'Tech writer and analyst' },
  eve_builder: { followers: 2100, bio: 'Indie hacker' },
  frank_ai: { followers: 2800, bio: 'AI researcher' },
  grace_web3: { followers: 1900, bio: 'Web3 enthusiast' },
  henry_data: { followers: 2200, bio: 'Data scientist' },
  iris_crypto: { followers: 3100, bio: 'Crypto trader' },
  jack_robotics: { followers: 2600, bio: 'Robotics engineer' },
  kate_energy: { followers: 1700, bio: 'Clean energy advocate' },
  leo_space: { followers: 2400, bio: 'Space tech enthusiast' },
  mia_neural: { followers: 2900, bio: 'Neural networks researcher' },
  nancy_llm: { followers: 3300, bio: 'LLM specialist' },
  oscar_ml: { followers: 2700, bio: 'Machine learning engineer' },
  patricia_nlp: { followers: 2500, bio: 'NLP researcher' },
  quinn_vision: { followers: 2300, bio: 'Computer vision expert' },
  rachel_ai: { followers: 2800, bio: 'AI ethics researcher' },
  steve_transformer: { followers: 3000, bio: 'Transformer models expert' },
  tina_philosophy: { followers: 1600, bio: 'Philosophy & tech writer' },
  uma_crypto: { followers: 2400, bio: 'Cryptocurrency analyst' },
  victor_bitcoin: { followers: 2900, bio: 'Bitcoin maximalist' },
  wendy_defi: { followers: 2200, bio: 'DeFi developer' },
  xavier_web3: { followers: 2600, bio: 'Web3 builder' },
  yara_nft: { followers: 1900, bio: 'NFT artist' },
  zack_crypto: { followers: 3100, bio: 'Crypto investor' },
  amy_blockchain: { followers: 2500, bio: 'Blockchain developer' },
  blake_web3: { followers: 2300, bio: 'Web3 entrepreneur' },
  clara_defi: { followers: 2700, bio: 'DeFi researcher' },
  david_nft: { followers: 2100, bio: 'NFT collector' },
  emma_token: { followers: 2400, bio: 'Token economics expert' },
};

function generateMockFollowers(username, limit = 50) {
  const followers = mockFollowers[username.toLowerCase()] || [];
  const selected = followers.slice(0, Math.min(limit, followers.length));
  
  return selected.map(handle => ({
    username: handle,
    followers: accountDetails[handle]?.followers || Math.floor(Math.random() * 5000) + 1000,
    bio: accountDetails[handle]?.bio || 'Twitter user',
    url: `https://twitter.com/${handle}`,
    verified: Math.random() > 0.7,
  }));
}

module.exports = { generateMockFollowers };
