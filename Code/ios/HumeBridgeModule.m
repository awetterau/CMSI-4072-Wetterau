#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(HumeBridge, RCTEventEmitter)

// Add the resolver and rejecter to the macro
RCT_EXTERN_METHOD(connect:(NSString *)apiKey
                  configId:(NSString *)configId
                  systemPrompt:(NSString *)systemPrompt
                  variables:(NSDictionary *)variables
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(disconnect)

RCT_EXTERN_METHOD(setMuted:(BOOL)muted)

@end
