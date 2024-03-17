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
  const [rpcBlocks, setRpcBlocks] = useState<number>(0);
  const [blocks, setBlocks] = useState<number>(0);
  const [startBlock, setStartBlock] =
    useState<number>(14054677);
  const [numBlocks, setNumBlocks] = useState<number>(10);

  const SUBSTREAM = "/substreams.spkg";
  const TOKEN = process.env.NEXT_PUBLIC_KEY;
  let request: any;
  let transport: any;

  const rpc = async (
    numBlocks: number = 10,
    startBlock: number = 14000000
  ) => {
    const MODULE = "map_erc721_rpc";
    const substream = await fetchSubstream("/rpc.spkg");
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
      startBlockNum: startBlock,
      stopBlockNum: `+${numBlocks}`,
    });

    // console.log(request);
    console.log("Streaming....");
    for await (const response of streamBlocks(
      transport,
      request
    )) {
      if (response.message.case == "blockScopedData") {
        setRpcBlocks((prev) => prev + 1);
      }
    }
  };

  const norpc = async (
    numBlocks: number = 10,
    startBlock: number = 14000000
  ) => {
    const MODULE = "erc721_out";
    const substream = await fetchSubstream("/rpc.spkg");
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
      startBlockNum: startBlock,
      stopBlockNum: `+${numBlocks}`,
    });

    // console.log(request);
    console.log("Streaming....");
    for await (const response of streamBlocks(
      transport,
      request
    )) {
      if (response.message.case == "blockScopedData") {
        setBlocks((prev) => prev + 1);
      }
    }
  };
  // };

  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="text-white text-2xl w-full flex items-center justify-between text-center">
        <div>
          <h1>RPC calls 💩</h1>
          <h1>Blocks processed: {rpcBlocks}</h1>
        </div>
        <div>
          <h1>No RPC 👨🏼‍🎓</h1>
          <h1>Blocks processed: {blocks}</h1>
        </div>
      </div>
      <div className="text-white w-full flex justify-center">
        <form
          onSubmit={(e: any) => {
            e.preventDefault();
            rpc(numBlocks, startBlock);
            norpc(numBlocks, startBlock);
          }}
          className="flex-col w-1/2 items-center justify-center mt-10">
          <div className="flex justify-between w-full">
            <div className="flex flex-col gap-2">
              <label className="flex-start">
                Start Block:
              </label>
              <input
                className="text-black py-1 px-2"
                type="number"
                min={1}
                value={startBlock}
                onChange={(e) =>
                  setStartBlock(+e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex-start">
                Blocks to process:
              </label>
              <input
                className="text-black py-1 px-2"
                type="number"
                min={1}
                value={numBlocks}
                onChange={(e) =>
                  setNumBlocks(+e.target.value)
                }
              />
            </div>
          </div>
          <div className="w-full flex justify-center p-10">
            <button
              type="submit"
              className="bg-white text-black px-3 py-2 font-semibold rounded-md hover:scale-[1.02] acitve:scale-[0.98] duration-300">
              Stream
            </button>
          </div>
        </form>
        {/* {juice?.map((token: any, index: number) => (
          <div
            key={(token.address + token.tokenId, +index)}>
            <div>{token.address}</div>
            <div>{token.tokenId}</div>
          </div>
        ))} */}
      </div>
    </main>
  );
}
