import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "pika-secret-key-2024";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Mock Data for Users
  let users = [
    { id: "admin-1", username: "Ayan", role: "admin", isBanned: false, email: "admin@pika.studio" },
  ];

  // Mock Data for Anime
  let animeData = [
    {
      id: "op-1",
      title: "One Piece",
      type: "Series",
      genre: ["Action", "Adventure", "Fantasy"],
      rating: 8.9,
      year: 1999,
      image: "https://picsum.photos/seed/onepiece/800/1200",
      banner: "https://picsum.photos/seed/onepiece-banner/1920/1080",
      description: "Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the king of all pirates.",
      trending: true,
      popular: true,
      languages: ["Japanese", "English", "Spanish"],
      comments: [],
      reviews: [],
      episodes: Array.from({ length: 1100 }, (_, i) => ({
        id: `ep-${i + 1}`,
        number: i + 1,
        title: `Episode ${i + 1}: The Great Adventure Begins`,
        duration: "24:00",
        thumbnail: `https://picsum.photos/seed/op-ep-${i + 1}/320/180`,
        languages: ["Japanese", "English", "Spanish"],
        comments: [],
        reviews: []
      }))
    },
    {
      id: "1",
      title: "Neon Genesis Evangelion",
      type: "Series",
      genre: ["Sci-Fi", "Mecha", "Psychological"],
      rating: 8.9,
      year: 1995,
      image: "https://picsum.photos/seed/evangelion/800/1200",
      banner: "https://picsum.photos/seed/eva-banner/1920/1080",
      description: "A teenage boy finds himself recruited as a member of an elite team of pilots by his father.",
      trending: true,
      popular: true,
      languages: ["Japanese", "English"],
      comments: [],
      reviews: []
    },
    {
      id: "2",
      title: "Spirited Away",
      type: "Movie",
      genre: ["Adventure", "Supernatural"],
      rating: 9.1,
      year: 2001,
      image: "https://picsum.photos/seed/spirited/800/1200",
      banner: "https://picsum.photos/seed/spirited-banner/1920/1080",
      description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
      trending: true,
      popular: true,
      languages: ["Japanese", "English", "French"],
      comments: [],
      reviews: []
    }
  ];

  let customMedia = [];

  // AniList API Integration
  const ANILIST_URL = "https://graphql.anilist.co";

  async function fetchAniList(query: string, variables: any = {}) {
    try {
      const response = await fetch(ANILIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("AniList Fetch Error:", error);
      return null;
    }
  }

  const MEDIA_QUERY = `
    query ($id: Int, $page: Int, $perPage: Int, $search: String, $type: MediaType, $sort: [MediaSort], $genre: String, $year: Int) {
      Page (page: $page, perPage: $perPage) {
        media (id: $id, search: $search, type: $type, sort: $sort, genre: $genre, seasonYear: $year) {
          id
          title { romaji english native }
          type
          genres
          averageScore
          seasonYear
          description
          bannerImage
          coverImage { extraLarge large }
          trending
          popularity
          episodes
          nextAiringEpisode { airingAt timeUntilAiring episode }
        }
      }
    }
  `;

  function mapAniListToPika(media: any) {
    // Simulate multiple languages based on popularity/genres
    const baseLanguages = ["Japanese", "English"];
    const extraLanguages = ["Spanish", "French", "German", "Portuguese", "Hindi", "Chinese", "Korean"];
    const languages = [...baseLanguages];
    
    // Add 2-3 random extra languages to simulate "every language" support
    const seed = media.id % extraLanguages.length;
    languages.push(extraLanguages[seed]);
    languages.push(extraLanguages[(seed + 1) % extraLanguages.length]);

    return {
      id: `al-${media.id}`,
      title: media.title.english || media.title.romaji || media.title.native,
      type: media.type === "ANIME" ? "Series" : "Movie",
      genre: media.genres,
      rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : "N/A",
      year: media.seasonYear,
      image: media.coverImage.extraLarge || media.coverImage.large,
      banner: media.bannerImage || media.coverImage.extraLarge,
      description: media.description?.replace(/<[^>]*>?/gm, "") || "No description available.",
      trending: media.trending > 20,
      popular: media.popularity > 5000,
      languages: Array.from(new Set(languages)), 
      episodesCount: media.episodes,
      nextEpisode: media.nextAiringEpisode,
      source: "AniList"
    };
  }

  const AIRING_QUERY = `
    query ($page: Int, $perPage: Int, $airingAt_greater: Int, $airingAt_lesser: Int) {
      Page (page: $page, perPage: $perPage) {
        airingSchedules (airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME_DESC) {
          id
          airingAt
          episode
          media {
            id
            title { romaji english native }
            type
            genres
            averageScore
            seasonYear
            description
            bannerImage
            coverImage { extraLarge large }
          }
        }
      }
    }
  `;

  // API Routes
  app.get("/api/media/airing", async (req, res) => {
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 86400;
    const dayAhead = now + 86400;

    const data = await fetchAniList(AIRING_QUERY, {
      airingAt_greater: dayAgo,
      airingAt_lesser: dayAhead,
      perPage: 20
    });

    const airing = data?.Page?.airingSchedules?.map((item: any) => ({
      ...mapAniListToPika(item.media),
      airingAt: item.airingAt,
      episode: item.episode
    })) || [];

    res.json(airing);
  });

  app.get("/api/media", async (req, res) => {
    const { type, genre, year, search, page = 1 } = req.query;
    
    // Fetch from AniList
    const variables = {
      page: parseInt(page as string),
      perPage: 20,
      search: search as string,
      type: "ANIME",
      genre: genre as string,
      year: year ? parseInt(year as string) : undefined,
      sort: search ? ["SEARCH_MATCH"] : ["POPULARITY_DESC"]
    };

    const data = await fetchAniList(MEDIA_QUERY, variables);
    const aniListMedia = data?.Page?.media?.map(mapAniListToPika) || [];

    // Merge with local custom media
    let filteredCustom = [...customMedia];
    if (search) filteredCustom = filteredCustom.filter(m => m.title.toLowerCase().includes((search as string).toLowerCase()));
    
    res.json([...filteredCustom, ...aniListMedia]);
  });

  app.get("/api/media/trending", async (req, res) => {
    const data = await fetchAniList(MEDIA_QUERY, { sort: ["TRENDING_DESC"], perPage: 10, type: "ANIME" });
    const trending = data?.Page?.media?.map(mapAniListToPika) || [];
    res.json(trending);
  });

  app.get("/api/media/popular", async (req, res) => {
    const data = await fetchAniList(MEDIA_QUERY, { sort: ["POPULARITY_DESC"], perPage: 10, type: "ANIME" });
    const popular = data?.Page?.media?.map(mapAniListToPika) || [];
    res.json(popular);
  });

  app.get("/api/media/:id", async (req, res) => {
    const { id } = req.params;
    
    if (id.startsWith("al-")) {
      const aniId = parseInt(id.replace("al-", ""));
      const data = await fetchAniList(MEDIA_QUERY, { id: aniId });
      const media = data?.Page?.media?.[0];
      if (media) return res.json(mapAniListToPika(media));
    }

    const media = [...animeData, ...customMedia].find(m => m.id === id);
    if (media) res.json(media);
    else res.status(404).json({ error: "Media not found" });
  });

  // Comments and Reviews API
  app.post("/api/media/:id/comment", (req, res) => {
    const { userId, username, avatar, text } = req.body;
    const media = [...animeData, ...customMedia].find(m => m.id === req.params.id);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const newComment = {
      id: `c-${Date.now()}`,
      userId,
      username,
      avatar,
      text,
      date: new Date().toISOString()
    };

    if (!media.comments) media.comments = [];
    media.comments.unshift(newComment);
    res.json(newComment);
  });

  app.post("/api/media/:id/review", (req, res) => {
    const { userId, username, rating, comment } = req.body;
    const media = [...animeData, ...customMedia].find(m => m.id === req.params.id);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const newReview = {
      id: `r-${Date.now()}`,
      userId,
      username,
      rating,
      comment,
      date: new Date().toISOString()
    };

    if (!media.reviews) media.reviews = [];
    media.reviews.unshift(newReview);
    
    // Update overall rating
    const totalRating = media.reviews.reduce((acc, r) => acc + r.rating, 0);
    media.rating = parseFloat((totalRating / media.reviews.length).toFixed(1));

    res.json(newReview);
  });

  // Auth APIs
  app.post("/api/auth/google", async (req, res) => {
    const { credential } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) return res.status(400).json({ error: "Invalid token" });

      const { sub: googleId, email, name, picture } = payload;

      // Find or create user
      let user = users.find(u => (u as any).googleId === googleId || u.email === email);
      if (!user) {
        user = {
          id: `user-${googleId}`,
          username: name || email?.split('@')[0] || "User",
          role: "user",
          isBanned: false,
          email: email || "",
          avatar: picture,
          googleId: googleId,
          method: "Google"
        } as any;
        users.push(user as any);
      }

      // Create JWT
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

      // Set HTTP-only cookie
      res.cookie("pika_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(401).json({ error: "Authentication failed" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.pika_auth;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = users.find(u => u.id === decoded.id);
      if (!user) return res.status(401).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: "Invalid session" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("pika_auth");
    res.json({ success: true });
  });

  // Admin APIs
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === "Ayan") {
      res.json({ success: true, user: users[0] });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  app.get("/api/admin/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/admin/user/:id/action", (req, res) => {
    const { action } = req.body; // action: 'ban' | 'unban'
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (action === "ban") user.isBanned = true;
    if (action === "unban") user.isBanned = false;

    res.json({ success: true, user });
  });

  // Upload API
  app.post("/api/media/upload", (req, res) => {
    const { title, description, uploaderId, isCopyrightFree, role, season, episodeNumber, languages } = req.body;
    
    if (role !== "admin" && !isCopyrightFree) {
      return res.status(403).json({ error: "Users can only upload copyright-free content." });
    }

    const newMedia = {
      id: `custom-${Date.now()}`,
      title,
      description,
      type: "Series",
      genre: ["User Upload"],
      rating: 0,
      year: new Date().getFullYear(),
      image: "https://picsum.photos/seed/upload/800/1200",
      banner: "https://picsum.photos/seed/upload-banner/1920/1080",
      uploaderId,
      isCopyrightFree,
      trending: false,
      popular: false,
      season: season || 1,
      episodeNumber: episodeNumber || 1,
      languages: languages || ["Japanese"],
      comments: [],
      reviews: []
    };

    customMedia.push(newMedia as any);
    res.json({ success: true, media: newMedia });
  });

  // Storage API (Mock)
  let userStorage = [
    { id: "u1", name: "My Hero Academia S1.mp4", size: "1.2GB", date: "2024-02-20", quality: "1080p" },
    { id: "u2", name: "Akira - Remastered.mkv", size: "4.5GB", date: "2024-02-25", quality: "4K" },
  ];

  app.get("/api/storage", (req, res) => {
    res.json(userStorage);
  });

  app.post("/api/storage/upload", (req, res) => {
    const { name, size } = req.body;
    const newItem = {
      id: `u${Date.now()}`,
      name: name || "Untitled Upload",
      size: size || "Unknown",
      date: new Date().toISOString().split('T')[0],
      quality: "1080p"
    };
    userStorage.push(newItem);
    res.json(newItem);
  });

  // Downloads API (Mock)
  let userDownloads = [
    { id: "d1", mediaId: "1", title: "Neon Genesis Evangelion", image: "https://picsum.photos/seed/evangelion/800/1200", size: "850MB", progress: 100, status: "Completed", date: "2024-02-26" },
    { id: "d2", mediaId: "2", title: "Spirited Away", image: "https://picsum.photos/seed/spirited/800/1200", size: "1.4GB", progress: 45, status: "Downloading", date: "2024-02-27" },
  ];

  app.get("/api/downloads", (req, res) => {
    res.json(userDownloads);
  });

  app.post("/api/downloads/add", (req, res) => {
    const { mediaId, title, image } = req.body;
    const existing = userDownloads.find(d => d.mediaId === mediaId);
    if (existing) return res.json(existing);

    const newItem = {
      id: `d${Date.now()}`,
      mediaId,
      title,
      image,
      size: "Calculating...",
      progress: 0,
      status: "Downloading",
      date: new Date().toISOString().split('T')[0]
    };
    userDownloads.push(newItem);
    res.json(newItem);
  });

  app.delete("/api/downloads/:id", (req, res) => {
    userDownloads = userDownloads.filter(d => d.id !== req.params.id);
    res.json({ success: true });
  });

  // Global Error Handler to prevent site crashing
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Something went wrong on the server" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
