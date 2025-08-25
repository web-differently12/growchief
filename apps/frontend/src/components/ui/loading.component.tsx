"use client";

import { Oval } from "react-loader-spinner";

import type { FC } from "react";

export const LoadingComponent: FC<{
  width?: number;
  height?: number;
  color?: string;
}> = (props) => {
  return (
    <Oval
      color={props.color || "#612bd3"}
      secondaryColor={props.color || "#612bd3"}
      width={props.width || 100}
      height={props.height || 100}
    />
  );
};
