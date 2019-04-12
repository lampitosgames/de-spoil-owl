class OwlGame {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.video = _rawData.video;
    this.thumb = _rawData.thumb;
  }
}

class OwlMatch {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.thumb = _rawData.thumb;
  }
}

class Watchpoint {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.video = _rawData.video;
    this.thumb = _rawData.thumb;
  }
}

module.exports = { OwlGame, OwlMatch, Watchpoint };