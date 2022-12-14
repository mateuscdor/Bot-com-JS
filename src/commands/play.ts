import fs from "fs";
import path from "path";
import axios from "axios";
import yts from "yt-search";
import ytdl from "ytdl-core";

import { IBotData } from "../interfaces/IBotData";
import { getRandomName } from "../functions";

export default async ({ reply, sendImage, sendAudio, args }: IBotData) => {
  await reply("Aguarde... Pesquisando... ⌛");

  const maxLength = 100;

  if (!args || args.length > 100) {
    return await reply(`⚠ Limite de ${maxLength} caracteres por pesquisa!`);
  }

  const result = await yts(args);

  if (!result || !result.videos.length) {
    return await reply(`⚠ Nenhuma música encontrada!`);
  }

  const video = result.videos[0];

  const response = await axios.get(video.image, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data, "utf-8");

  let dateText = "";

  if (video.ago) {
    dateText = `\n*Data*: ${video.ago
      .replace("ago", "atrás")
      .replace("years", "anos")
      .replace("months", "meses")}`;
  }

  await sendImage(
    buffer,
    `Dados encontrados
  
*Título*: ${video.title}

*Descrição*: ${video.description}

*Duração*: ${video.timestamp}${dateText}
*Views*: ${video.views}

Realizando download... ⌛`
  );

  const tempFile = path.resolve(
    __dirname,
    "..",
    "..",
    "assets",
    "temp",
    getRandomName("mp3")
  );

  ytdl(video.url)
    .pipe(fs.createWriteStream(tempFile))
    .on("finish", async () => {
      await sendAudio(tempFile, true, false);
      fs.unlinkSync(tempFile);
    });
};
