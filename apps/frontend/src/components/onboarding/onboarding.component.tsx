import { useSearchParams } from "react-router";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { type FC, useEffect } from "react";

export const OnboardingComponent = () => {
  const [query] = useSearchParams();
  const onboarding = query.get("onboarding");

  if (onboarding === "true") {
    return <OnboardingComponentInner />;
  }

  return null;
};

export const OnboardingComponentInner = () => {
  const [_, setQuery] = useSearchParams();
  const { show, closeAll } = useModals();
  useEffect(() => {
    show({
      label: "Onboarding",
      askClose: true,
      beforeClose: () =>
        setQuery((p) => {
          p.delete("onboarding");
          return p;
        }),
      component: (close) => (
        <OnboardingRenderComponent
          close={() => {
            setQuery((p) => {
              p.delete("onboarding");
              return p;
            });
            close();
          }}
        />
      ),
    });
    return () => {
      closeAll();
    };
  }, []);
  return null;
};

const OnboardingRenderComponent: FC<{ close: () => void }> = () => {
  return null;
};
