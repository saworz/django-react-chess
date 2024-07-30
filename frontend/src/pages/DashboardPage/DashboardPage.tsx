import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import axios from "axios";
import NewsCardList from "../../components/DashboardPage/NewsCardList/NewsCardList";

interface INewsType {
  image: string;
  title: string;
  description: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isError, message } = useSelector((state: RootState) => state.auth);
  const [newsList, setNewsList] = useState<INewsType[]>([]);

  const getNewsList = async () => {
    const response = await axios.get(
      "https://corsproxy.io/?https://www.chess.com/news"
    );

    const html = response.data;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const articlesList = Array.from(doc.querySelectorAll("article"));

    const articlesData = articlesList.map((article) => {
      const imgElement = article.querySelector(".post-preview-thumbnail");
      const image = imgElement
        ? imgElement.getAttribute("data-src") ||
          imgElement.getAttribute("src") ||
          "No image"
        : "No image";

      const timeElement = article.querySelector(
        ".post-preview-meta-content time"
      );
      const datetime = timeElement
        ? timeElement.getAttribute("datetime")
        : "No datetime";

      return {
        image,
        title:
          article.querySelector(".post-preview-title")?.textContent?.trim() ||
          "No title",
        description:
          article.querySelector(".post-preview-excerpt")?.textContent?.trim() ||
          "No description",
        datetime,
      };
    });
    setNewsList(articlesData);
  };

  useEffect(() => {
    if (isError) {
      console.log(message);
    }
  }, [navigate, isError, message]);

  useEffect(() => {
    getNewsList();
  }, []);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      flex={1}
      direction="column"
    >
      {newsList.length > 0 && <NewsCardList newsData={newsList} />}
    </Flex>
  );
};

export default DashboardPage;
