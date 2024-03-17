"use client";

// import { createGrpcTransport } from "@connectrpc/connect-node";
import { useEffect, useState } from "react";
import {
  createAuthInterceptor,
  createRegistry,
  createRequest,
  fetchSubstream,
  isEmptyMessage,
  streamBlocks,
  unpackMapOutput,
} from "@substreams/core";
import { createConnectTransport } from "@bufbuild/connect-web";
// import {} from "@substreams/manifest";
// import {} from "@substreams/react";
import { useSubstream } from "@substreams/react";
import { randomUUID } from "crypto";

export default function Home() {
  const [juice, setJuice] = useState<any>([]);
  const [blocks, setBlocks] = useState<number>(0);
  const SUBSTREAM = "/substreams.spkg";
  const MODULE = "map_erc721";
  const TOKEN = process.env.NEXT_PUBLIC_KEY;
  let request: any;
  let transport: any;

  const main = async () => {
    const substream = await fetchSubstream(SUBSTREAM);
    const registry = createRegistry(substream);

    transport = createConnectTransport({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
      //@ts-ignore
      interceptors: [createAuthInterceptor(TOKEN)],
      useBinaryFormat: true,
      jsonOptions: {
        typeRegistry: registry,
      },
    });

    request = createRequest({
      substreamPackage: substream,
      outputModule: MODULE,
      productionMode: true,
      stopBlockNum: "+1",
    });

    // console.log(request);
    console.log("Streaming....");
    for await (const response of streamBlocks(
      transport,
      request
    )) {
      console.log("response: ", response);
      if (response.message.case == "blockScopedData") {
        setBlocks((prev) => prev + 1);
      }
      //add 1
      const output = unpackMapOutput(response, registry);

      if (output !== undefined && !isEmptyMessage(output)) {
        // setBlocks((prev) => prev + 1);
        const outputAsJson = output.toJson({
          typeRegistry: registry,
        });
        //@ts-ignore
        let tokens: any = output.tokens;

        if (tokens) {
          console.log("tokens: ", tokens);
          // setJuice(tokens);
          setJuice((prev: any) => {
            return [...prev, ...tokens];
          });
        }
      }
    }
  };
  useEffect(() => {
    main();
    // setup();
    // console.log("juiceer", juice);
  }, []);

  // useEffect(() => {
  //   console.log("juiceer", juice);
  // }, [juice]);

  // const {} = useSubstream({
  //   request,
  //   transport,
  //   handlers: {},
  // });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-white text-2xl">
        Blocks processed: {blocks}
      </div>
      <div className="text-white text-2xl">
        {juice?.length}
      </div>
      <div className="text-white">
        {juice?.map((token: any, index: number) => (
          <div
            key={(token.address + token.tokenId, +index)}>
            <div>{token.address}</div>
            <div>{token.tokenId}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
