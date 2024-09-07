# Cherry 🍒

Cherry is a web application designed to help developers meet, connect, and start great collaborations. Built with Next.js and leveraging blockchain technology, Cherry offers a unique platform for networking and project collaboration in the developer community.

## Features

- User profiles with customizable information
- Matching system for connecting developers
- Chat functionality with integrated payment system, thanks to Request Network
- World ID verification for an enhanced trust layer
- Talent Passport scoring system for a more informed matching process

## Technology Stack

- [Request Network](https://request.network/) - For in chat integrated payment of requests and invoices
- [World ID](https://worldcoin.org/world-id) - For user verification and security
- [Celo](https://celo.org/) - For safe and low-cost transactions on Celo blockchain through Request Network.
- [Mantle](https://mantle.xyz/) - Leveraged the ethereum rollup Mantle to create, send and pay Request Network invoices
- [Ora](https://www.oracles.org/) - To generate a score for the matched users based on their chat history. Code can be found [here](https://github.com/deca12x/OraChatScore/blob/main/src/Prompt.sol)
- [DBForest](https://www.dbforest.org/) - Deployed PostgreSQL database on DBForest to store user information, chat history, and other relevant data
- [Talent Passport](https://passport.talentprotocol.com/signin) - To allow users to better evaluate each other's profile and skills

## License

GPLv3

## Acknowledgements

This project was created during the ETHWarsaw 2024 hackathon.
