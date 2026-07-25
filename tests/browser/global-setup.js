module.exports=async()=>{
  const {server,ready}=await import('./server.mjs');
  await ready;

  return async()=>{
    await new Promise(resolve=>{
      server.close(resolve);
      server.closeAllConnections?.();
    });
  };
};
