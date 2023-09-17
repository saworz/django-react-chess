import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import AppTheme from "./chakra/AppTheme";
import Layout from "../layout/Layout";
import RouterProvider from "./router";
import { Provider } from "react-redux";
import theme from "./chakra/AppTheme";
import { store } from "../app/store";

type Props = {};

const Providers = (props: Props) => {
  return (
    <Provider store={store}>
      <ChakraProvider theme={AppTheme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Layout>
          <RouterProvider />
        </Layout>
      </ChakraProvider>
    </Provider>
  );
};

export default Providers;