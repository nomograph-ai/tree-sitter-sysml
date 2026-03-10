#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_sysml();

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports["name"] = Napi::String::New(env, "sysml");
    auto language = Napi::External<TSLanguage>::New(env, tree_sitter_sysml());
    exports["language"] = language;
    return exports;
}

NODE_API_MODULE(tree_sitter_sysml_binding, Init)
