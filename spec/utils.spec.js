process.env.NODE_ENV = "test";
const { expect } = require("chai");
const {
  formatDates,
  makeRefObj,
  formatComments
} = require("../db/utils/utils");

describe("formatDates", () => {
  it("function returns an array", () => {
    const output = formatDates();

    expect(output).to.be.an("array");
  });
  it("function returns an array of the same length as the input array", () => {
    const input = [{}, {}, {}];
    const output = formatDates(input);
    expect(output.length).to.equal(3);
  });
  it("function returns an array of objects with the same keys as the passed objects", () => {
    const input = [
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      },
      {
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body:
          "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: 1163852514171
      },
      {
        title: "UNCOVERED: catspiracy to bring down democracy",
        topic: "cats",
        author: "rogersop",
        body: "Bastet walks amongst us, and the cats are taking arms!",
        created_at: 1037708514171
      }
    ];
    const output = formatDates(input);
    output.forEach(inputObject => {
      expect(inputObject).to.have.keys(
        "title",
        "topic",
        "author",
        "body",
        "created_at"
      );
    });
  });
  it("the original array have not been mutated", () => {
    const input = [
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      },
      {
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body:
          "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: 1163852514171
      },
      {
        title: "UNCOVERED: catspiracy to bring down democracy",
        topic: "cats",
        author: "rogersop",
        body: "Bastet walks amongst us, and the cats are taking arms!",
        created_at: 1037708514171
      }
    ];
    formatDates(input);
    expect(input).to.deep.equal([
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      },
      {
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body:
          "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: 1163852514171
      },
      {
        title: "UNCOVERED: catspiracy to bring down democracy",
        topic: "cats",
        author: "rogersop",
        body: "Bastet walks amongst us, and the cats are taking arms!",
        created_at: 1037708514171
      }
    ]);
  });
  it("the objects within the array are not mutated when the function is called", () => {
    const input = [
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      },
      {
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body:
          "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: 1163852514171
      },
      {
        title: "UNCOVERED: catspiracy to bring down democracy",
        topic: "cats",
        author: "rogersop",
        body: "Bastet walks amongst us, and the cats are taking arms!",
        created_at: 1037708514171
      }
    ];
    formatDates(input);
    expect(input[0]).to.deep.equal({
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      author: "icellusedkars",
      body: "some gifs",
      created_at: 1289996514171
    });
  });
  it("the returned array and sub objects are not a reference to the input array", () => {
    const input = [
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      }
    ];
    const output = formatDates(input);
    expect(output).to.not.equal(input);
    expect(output[0]).to.not.equal(input[0]);
  });
  it("the returned objects contain a created_timeStamp key that is a datetime object ", () => {
    const input = [
      {
        title: "Moustache",
        topic: "mitch",
        author: "butter_bridge",
        body: "Have you seen the size of that thing?",
        created_at: 154700514171
      }
    ];
    const output = formatDates(input);
    expect(output[0].created_at).to.be.an.instanceof(Date);
  });
});

describe("makeRefObj", () => {
  it("returns an object ", () => {
    const output = makeRefObj();
    expect(output).to.be.an("object");
  });
  it("returns a reference object with a single kvp when passed an array with a single object", () => {
    const input = [
      {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const output = makeRefObj(input);
    const expected = {
      "Living in the shadow of a great man": 1
    };
    expect(output).to.deep.equal(expected);
  });
  it("returns a reference object with multiple kvp when passed an array of multiple article objects", () => {
    const input = [
      {
        article_id: 1,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      },
      {
        article_id: 2,
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body:
          "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: 1163852514171
      },
      {
        article_id: 3,
        title: "UNCOVERED: catspiracy to bring down democracy",
        topic: "cats",
        author: "rogersop",
        body: "Bastet walks amongst us, and the cats are taking arms!",
        created_at: 1037708514171
      }
    ];

    const output = makeRefObj(input);
    const expected = {
      "Eight pug gifs that remind me of mitch": 1,
      "Student SUES Mitch!": 2,
      "UNCOVERED: catspiracy to bring down democracy": 3
    };
    expect(output).to.deep.equal(expected);
  });
  it("the original array is not mutated", () => {
    const original = [
      {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    makeRefObj(original);
    expect(original).to.deep.equal([
      {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ]);
  });
  it("the article objects are not mutated when used in the reference object", () => {
    const original = [
      {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    makeRefObj(original);
    expect(original[0]).to.deep.equal({
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: 1542284514171,
      votes: 100
    });
  });
});

describe("formatComments", () => {
  it("returns an array", () => {
    const output = formatComments();
    expect(output).to.be.an("array");
  });
  it("when passed an array with one comment object, returns an array with one comment object in a format ready for database seeding", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const refObj = {
      "They're not exactly dogs, are they?": 1
    };
    const output = formatComments(input, refObj);
    expect(output[0]).to.have.keys(
      "author",
      "article_id",
      "created_at",
      "body",
      "votes"
    );
  });
  it("A returned comment has a propertly-formated created_on value", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const refObj = {
      "They're not exactly dogs, are they?": 1
    };
    const output = formatComments(input, refObj);
    expect(output[0].created_at).to.be.an.instanceof(Date);
  });
  it("when passed an array of multiple comments, returns an array of multiple shops that have been formatted ready for database seeding", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      },
      {
        body:
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge",
        votes: 14,
        created_at: 1479818163389
      },
      {
        body:
          "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "icellusedkars",
        votes: 100,
        created_at: 1448282163389
      }
    ];
    const refObj = {
      "They're not exactly dogs, are they?": 1,
      "Living in the shadow of a great man": 2
    };
    const output = formatComments(input, refObj);
    output.forEach(comment => {
      expect(comment).to.have.keys(
        "author",
        "article_id",
        "created_at",
        "body",
        "votes"
      );
      expect(comment.created_at).to.be.an.instanceof(Date);
    });
  });
  it("the original array is not mutated", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const refObj = {
      "They're not exactly dogs, are they?": 1
    };
    formatComments(input, refObj);
    expect(input).to.deep.equal([
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ]);
  });
  it("the returned comment is not the same reference as the input comment", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const refObj = {
      "They're not exactly dogs, are they?": 1
    };
    const output = formatComments(input, refObj);
    expect(output[0]).to.not.equal(input);
  });
});
