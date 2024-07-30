import { Flex } from "@chakra-ui/react";
import NewsCard from "../NewsCard/NewsCard";

const NewsCardList = ({ newsData }: any) => {
  return (
    <Flex justifyContent="center" flexWrap="wrap" gap={5}>
      {newsData.map((item: any, index: number) => (
        <NewsCard
          key={index}
          description={item.description}
          image={item.image}
          title={item.title}
          datetime={item.datetime}
        />
      ))}
    </Flex>
  );
};
export default NewsCardList;
