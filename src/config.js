export default {
  API_URL: process.env.WEBPACK ? "http://localhost:8080/app" : "/app",
  CLIENT_ROOT_URL: "",
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    authDomain: process.env.GOOGLE_AUTH_DOMAIN,
    clientId: "913307270840-751ad0psdu1q2a7m81np30g062osgpp5.apps.googleusercontent.com",
    hostedDomain: "g.ucla.edu",
  },
  routes: {
    user: {
      user: "/api/v1/user",
      activity: "/api/v1/user/activity",
      admins: "/api/v1/user/admins",
    },
    activity: "/api/v1/activity",
    auth: {
      register: "/api/v1/register",
      login: "/api/v1/auth/login",
    },
    events: {
      event: "/api/v1/event",
      past: "/api/v1/event/past",
      future: "/api/v1/event/future",
    },
    attendance: {
      fetch: "/api/v1/attendance",
      attend: "/api/v1/attendance/attend",
    },
    leaderboard: "/api/v1/leaderboard",
  },
  organization: {
    logo: "/assets/images/logo.png",
    logoLight: "/assets/images/logo-white.png",
    loginTileBackground: "/assets/images/login-tile-bg.jpg",
    shortName: "ACM chapter at UCLA",
    name: "Association for Computing Machinery chapter at UCLA",
    mission:
      "To create and support an inclusive community for all of those interested in computer science at UCLA and cultivate the next generation of technology leaders by fostering the spirit of innovation, a culture of creativity, and promoting equity, diversity, and inclusion within tech.",
    officers: [
      {
        name: "Matthew Wang",
        position: "President",
        picture: "/assets/images/officers/MattWang.jpg",
      },
      {
        name: "Tina Huang",
        position: "External Vice President",
        picture: "/assets/images/officers/TinaHuang.jpg",
      },
      {
        name: "Evan Zhong",
        position: "Internal Vice President",
        picture: "/assets/images/officers/EvanZhong.jpg",
      },
      {
        name: "Asha Kar",
        position: "Co-President, Hack",
        picture: "/assets/images/officers/AshaKar.jpg",
      },
      {
        name: "Eugene Lo",
        position: "Co-President, Hack",
        picture: "/assets/images/officers/EugeneLo.jpg",
      },
      {
        name: "Cindy Zhang",
        position: "President, ACM-W",
        picture: "/assets/images/officers/CindyZhang.jpg",
      },
      {
        name: "Justin Yi",
        position: "President, AI",
        picture: "/assets/images/officers/JustinYi.jpg",
      },
      {
        name: "Christian Loanzon",
        position: "Co-President, Game Studio",
        picture: "/assets/images/officers/ChristianLoanzon.jpg",
      },
      {
        name: "Peter Sutarjo",
        position: "Co-President, Game Studio",
        picture: "/assets/images/officers/PeterSutarjo.jpg",
      },
      {
        name: "Jacob Zhang",
        position: "President, ICPC",
        picture: "/assets/images/officers/JacobZhang.jpeg",
      },
      {
        name: "Henry Chang",
        position: "Co-President, Cyber",
        picture: "/assets/images/officers/HenryChang.jpg",
      },
      {
        name: "Joshua Lee",
        position: "Co-President, Cyber",
        picture: "/assets/images/officers/JoshLee.jpg",
      },
      {
        name: "Sophie Schoenmeyer",
        position: "President, Teach LA",
        picture: "/assets/images/officers/SophieSchoenmeyer.jpg",
      },
      {
        name: "Crystal Huynh",
        position: "President, Design",
        picture: "/assets/images/officers/CrystalHuynh.jpg",
      },
    ],
    resources: [
      {
        type: "facebook",
        title: "Facebook",
        subtitle: "facebook.com/uclaacm",
        link: "https://facebook.com/uclaacm",
      },
      {
        type: "twitter",
        title: "Twitter",
        subtitle: "twitter.com/uclaacm",
        link: "https://twitter.com/uclaacm",
      },
      {
        type: "github",
        title: "Github",
        subtitle: "github.com/uclaacm",
        link: "https://github.com/uclaacm",
      },
      {
        type: "website",
        title: "Website",
        subtitle: "acm.cs.ucla.edu",
        link: "https://acm.cs.ucla.edu",
      },
      {
        type: "medium",
        title: "Medium",
        subtitle: "tech@ucla",
        link: "https://medium.com/techatucla",
      },
      {
        type: "slack",
        title: "Slack",
        subtitle: "uclaacm.slack.com",
        link: "https://uclaacm.slack.com",
      },
    ],
  },
  levels: [
    { startsAt: 0, rank: "Hello, World!" },
    { startsAt: 20, rank: "Factorial Fly" },
    { startsAt: 40, rank: "Exponential Elephant" },
    { startsAt: 80, rank: "Cubic Chipmunk" },
    { startsAt: 120, rank: "Quadratic Quokka" },
    { startsAt: 180, rank: "Linearithmic Lizard" },
    { startsAt: 240, rank: "Linear Lemur" },
    { startsAt: 320, rank: "Square Root Sabre-Tooth" },
    { startsAt: 400, rank: "Logarithmic Lynx" },
    { startsAt: 500, rank: "Constant Cheetah" },
    { startsAt: 800, rank: "Extraterrestrial Eagle" },
    { startsAt: 1000, rank: "Binomial Baboon" },
    { startsAt: 1300, rank: "Scalar Scorpion" },
  ],
};
