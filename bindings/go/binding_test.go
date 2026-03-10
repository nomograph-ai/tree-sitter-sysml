package tree_sitter_sysml_test

import (
	"testing"

	tree_sitter_sysml "github.com/nomograph-ai/tree-sitter-sysml/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_sysml.Language())
	if language == nil {
		t.Errorf("Error loading SysML grammar")
	}
}
