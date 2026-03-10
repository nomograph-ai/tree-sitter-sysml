; Locals for SysML v2
; Defines scopes and definitions for scope-aware highlighting

; Scopes - bodies create new scopes
(package_body) @local.scope
(structural_body) @local.scope
(state_body) @local.scope
(requirement_body) @local.scope
(usage_body) @local.scope
(action_body) @local.scope
(enumeration_body) @local.scope
(constraint_body) @local.scope
(if_else_block) @local.scope
(then_if_block) @local.scope
(for_loop) @local.scope
(while_loop) @local.scope
(loop_until) @local.scope

; Definitions - names that are being defined
(part_definition
  (identification
    (name (identifier) @local.definition)))

(item_definition
  (identification
    (name (identifier) @local.definition)))

(port_definition
  (identification
    (name (identifier) @local.definition)))

(action_definition
  (identification
    (name (identifier) @local.definition)))

(state_definition
  (identification
    (name (identifier) @local.definition)))

(constraint_definition
  (identification
    (name (identifier) @local.definition)))

(requirement_definition
  (identification
    (name (identifier) @local.definition)))

(attribute_definition
  (identification
    (name (identifier) @local.definition)))

(enumeration_definition
  (identification
    (name (identifier) @local.definition)))

(connection_definition
  (identification
    (name (identifier) @local.definition)))

(interface_definition
  (identification
    (name (identifier) @local.definition)))

(allocation_definition
  (identification
    (name (identifier) @local.definition)))

(flow_definition
  (identification
    (name (identifier) @local.definition)))

(package_definition
  (identification
    (name (identifier) @local.definition)))

(metadata_definition
  (identification
    (name (identifier) @local.definition)))

(use_case_definition
  (identification
    (name (identifier) @local.definition)))

(calc_definition
  (identification
    (name (identifier) @local.definition)))

(occurrence_definition
  (identification
    (name (identifier) @local.definition)))

(verification_definition
  (identification
    (name (identifier) @local.definition)))

(analysis_definition
  (identification
    (name (identifier) @local.definition)))

(individual_definition
  (identification
    (name (identifier) @local.definition)))

(concern_definition
  (identification
    (name (identifier) @local.definition)))

(viewpoint_definition
  (identification
    (name (identifier) @local.definition)))

(view_definition
  (identification
    (name (identifier) @local.definition)))

(rendering_definition
  (identification
    (name (identifier) @local.definition)))

(case_definition
  (identification
    (name (identifier) @local.definition)))

(generic_definition
  (identification
    (name (identifier) @local.definition)))

; Usages also define names in their scope
(part_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(item_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(attribute_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(port_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(action_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(state_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(constraint_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(requirement_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(connection_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(interface_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(allocation_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(flow_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(calc_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(use_case_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(analysis_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(verification_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(view_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(rendering_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(occurrence_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(individual_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(concern_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(viewpoint_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(reference_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(parameter_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(generic_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(case_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(enumeration_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(actor_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(stakeholder_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(objective_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(variant_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(exhibit_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(event_occurrence_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(timeslice_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(snapshot_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(variation_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(metadata_usage
  (identification
    (name (identifier) @local.definition)))

(event_usage
  (identification
    (name (identifier) @local.definition)))

(end_usage
  (usage_declaration
    (identification
      (name (identifier) @local.definition))))

(end_usage
  (identification
    (name (identifier) @local.definition)))

(feature_usage
  (identification
    (name (identifier) @local.definition)))

; Statements as scopes
[
  (accept_then_statement)
  (allocate_statement)
  (assign_statement)
  (bind_statement)
  (connect_statement)
  (do_statement)
  (done_statement)
  (entry_statement)
  (exit_statement)
  (expose_statement)
  (expression_statement)
  (filter_statement)
  (frame_statement)
  (include_statement)
  (perform_statement)
  (redefines_statement)
  (redefinition_statement)
  (render_statement)
  (require_statement)
  (return_statement)
  (satisfy_statement)
  (send_statement)
  (specialization_statement)
  (subject_statement)
  (terminate_statement)
  (verify_statement)
] @local.scope

[
  (source_file)
  (accept_part)
  (allocation_part)
  (connect_endpoint)
  (connection_part)
  (crosses_part)
  (defined_by_part)
  (flow_part)
  (interface_endpoint)
  (interface_part)
  (nary_allocation_endpoint)
  (nary_connect_endpoint)
  (send_part)
  (annotation)
  (port_direction)
  (trigger_kind)
  (visibility)
  (binary_expression)
  (collection_expression)
  (feature_chain_expression)
  (index_expression)
  (measurement_expression)
  (meta_expression)
  (parenthesized_expression)
  (range_expression)
  (unary_expression)
  (unit_binary)
  (unit_exponent)
  (multiplicity)
  (multiplicity_bound)
  (then_succession)
  (wildcard_import)
  (named_argument)
] @local.scope

; References - names that refer to definitions
(qualified_name
  (name (identifier) @local.reference))
