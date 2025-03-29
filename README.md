# Job Posting Scraper

A tool for scraping job postings from various websites to help streamline your job search process.

## Description

Job Posting Scraper is a tool designed to automatically collect job listings from various job boards and company websites. It sends the user notification of new posting on pushover application. 

## Installation

### Prerequisites

- node version 22 or higher
- npm 10 or higher

### Setup

1. Clone this repository:
    ```
    git clone https://github.com/Divya047/Job-Posting-Scraper.git
    ```

2. Install the required dependencies:
    ```
    npm install
    ```

## Usage

### Basic Usage

Run the scraper with default settings:

```
npm start
```

### Configuration

Add the following environment variables:
```
DATABASE_USER_NAME
DATABASE_PASSWORD
DATABASE_HOST
DATABASE_PORT
DATABASE_CERTIFICATE (base64 encoded)
PUSHOVER_TOKEN
PUSHOVER_USER
JWT_SECRET
JWT_TOKEN
```
