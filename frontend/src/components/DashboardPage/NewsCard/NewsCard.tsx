import { CardBody, Text, Heading, Stack, Image, Box } from "@chakra-ui/react";
import * as Types from "./NewsCard.types";
import * as Styles from "./NewsCard.styles";

const NewsCard = ({ description, image, title, datetime }: Types.IProps) => {
  return (
    <Styles.StyledCard>
      <CardBody justifyContent="center">
        <Image src={image} alt={`${title}-image`} borderRadius="lg" />
        <Stack mt="6" spacing="3">
          <Heading size="md">{title}</Heading>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Styles.CalendarIconSvg />
            {datetime}
          </Box>
          <Text>{description}</Text>
        </Stack>
      </CardBody>
    </Styles.StyledCard>
  );
};

export default NewsCard;
