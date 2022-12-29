import { MyLayoutContext } from "components/layout/layout";
import { useContext, useEffect } from "react";

const FisStationPage = () => {
  const { setNavigation } = useContext(MyLayoutContext);

  useEffect(() => {
    setNavigation([{ name: "FIS Station", path: "/fis-station" }]);
  }, [setNavigation]);

  return <></>;
};

export default FisStationPage;
