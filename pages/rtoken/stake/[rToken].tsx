import { MyLayoutContext } from "components/layout/layout";
import React, { useEffect } from "react";

const RTokenStakePage = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  return <div></div>;
};

export default RTokenStakePage;
