NPMdex: A Distributed Search Engine for NPM Packages
=============
### Authors: Alyssa Cong, Calvin Eng, Spandan Goel, and Alexander Zheng
Link to paper-
[https://drive.google.com/file/d/1DIbSF5_Z_znnVK-dFhbZKsMROW9JgmLS/view?usp=sharing](https://drive.google.com/file/d/1CbQ6vxfygWuECFRUb5xI8IDlu28IPJV2/view)

## Project Details
This project implements a distributed search engine for npm (Node Package Manager) packages. It includes three main components: the crawler, which collects package information; the indexer, which organizes and indexes the data; and the query subsystem, which filters the data for results. Built with a custom serialization package, actor model with remote procedure calls (RPC), distributed key-value storage, and iterative MapReduce infrastructure, the repository comprises around 3500 lines of code.
