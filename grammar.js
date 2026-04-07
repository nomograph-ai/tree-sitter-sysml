/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * Tree-sitter grammar for SysML v2.
 *
 * Based on the official SysML v2 specification and Xtext grammar from:
 * https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation
 *
 * This grammar implements a practical subset of SysML v2 suitable for
 * AI-assisted Model-Based Systems Engineering (MBSE) workflows.
 */

const _PREC = { // eslint-disable-line no-unused-vars
  COMMENT: 1,
  VISIBILITY: 2,
  SPECIALIZATION: 3,
  TYPING: 4,
};

module.exports = grammar({
  name: 'sysml',

  extras: ($) => [$.comment, /\s/],

  word: ($) => $.identifier,

  conflicts: ($) => [
    // wildcard_import and qualified_name share a name :: name prefix
    [$.wildcard_import, $.qualified_name],
    // part vs part def ambiguity resolved by looking ahead
    [$.part_definition, $.part_usage],
    [$.item_definition, $.item_usage],
    [$.port_definition, $.port_usage],
    [$.action_definition, $.action_usage],
    [$.state_definition, $.state_usage],
    [$.constraint_definition, $.constraint_usage],
    [$.requirement_definition, $.requirement_usage],
    [$.connection_definition, $.connection_usage],
    [$.interface_definition, $.interface_usage],
    [$.allocation_definition, $.allocation_usage],
    [$.attribute_definition, $.attribute_usage],
    [$.flow_definition, $.flow_usage],
    [$.enumeration_definition, $.enumeration_usage],
    // flow_part vs flow_statement
    [$.flow_part, $.flow_statement],
    // flow_statement with identification vs usage_declaration
    [$.usage_declaration, $.flow_statement],
    // identification internal ambiguity (short_name alone vs short_name + name)
    [$.identification],
    // end_usage multiplicity vs usage_declaration multiplicity
    [$.usage_declaration, $.end_usage],
    // perform_statement vs usage_declaration
    [$.usage_declaration, $.perform_statement],
    // usage_declaration internal ambiguity with repeat(relationship_part)
    [$.usage_declaration],
    // feature_chain vs qualified_name
    [$.feature_chain, $.qualified_name],
    // perform with feature_chain vs identification
    [$.feature_chain, $.identification],
    // variant reference vs variant with declaration
    [$.identification, $.qualified_name],
    // interface endpoint vs identification
    [$.identification, $.interface_endpoint],
    [$.interface_endpoint, $.usage_declaration],
    // rendering definition vs usage
    [$.definition_body, $.usage_body],
    [$.rendering_definition, $.usage_declaration],
    [$.rendering_definition, $.rendering_usage],
    [$.event_occurrence_usage, $.event_usage],
    [$.metadata_usage, $.metadata_access_expression],
    [$.perform_statement, $.expression_statement],
    [$.reference_part, $.perform_statement],
    [$.nonunique_modifier, $.end_usage],
    [$.nonunique_modifier, $.perform_statement],
    [$._structural_member, $._behavioral_member],
    [$.usage_body, $.redefines_statement],
    // documentation with optional parts
    [$.documentation],
    // then action ambiguity
    [$.action_usage, $.then_succession],
    // definition_specialization vs specialization_part
    [$.definition_specialization, $.specialization_part],
    // individual keyword ambiguity: individual usage vs individual def
    [$.action_definition, $.individual_usage],
    [$.analysis_definition, $.individual_usage],
    // connect with metadata vs generic_usage
    [$.generic_usage, $.connect_statement],
    // feature_usage with relationship_part ambiguity
    [$.usage_body, $.subject_statement],
    [$.feature_usage, $.usage_declaration],
    // exhibit with qualified_name target vs usage_declaration
    [$.exhibit_usage, $.usage_declaration],
    [$.exhibit_usage, $.qualified_name],
    [$.usage_body, $.require_statement],
    // typing_part vs trigger_kind in accept
    [$.typing_part, $.trigger_kind],
    // then_if_block with else
    [$.then_if_block],
    // port_usage with simple identification vs usage_declaration
    [$.port_usage, $.usage_declaration],
    // if_else_block with else
    [$.if_else_block],
    // use_case_definition vs use_case_usage (variation use case)
    [$.use_case_definition, $.use_case_usage],
    // analysis_definition vs analysis_usage (variation analysis)
    [$.analysis_definition, $.analysis_usage],
    // verification_definition vs verification_usage (variation verification)
    [$.verification_definition, $.verification_usage],
    // action_body vs usage_body (semicolon)
    [$.action_body, $.usage_body],
    // verification_definition vs usage_declaration
    [$.verification_definition, $.usage_declaration],
    // analysis_definition vs usage_declaration
    [$.analysis_definition, $.usage_declaration],
    // use case: requirement_body vs usage_body
    [$.requirement_body, $.usage_body],
    // use_case_definition vs usage_declaration
    [$.use_case_definition, $.usage_declaration],
    // _usage_member vs _behavioral_member vs _structural_member
    [$._usage_member, $._behavioral_member, $._structural_member],
    [$._usage_member, $._structural_member],
    [$._usage_member, $._behavioral_member],
    [$._usage_member, $._requirement_member],
    // concern_definition vs concern_usage
    [$.case_definition, $.case_usage],
    [$.concern_definition, $.concern_usage],
    [$.case_definition, $.usage_declaration],
    [$.concern_definition, $.usage_declaration],
    [$.viewpoint_definition, $.viewpoint_usage],
    [$.viewpoint_definition, $.usage_declaration],
    [$.requirement_definition, $.usage_declaration],
    // textual_representation in action_body vs _usage_member
    [$.action_body, $._usage_member],
    // accept statement ambiguity
    [$.accept_then_statement, $.trigger_kind],
    [$.new_expression, $._argument],
    [$.shorthand_attribute, $.identification],
    [$.identification, $.name],
    [$.send_part],
    [$.parameter_usage, $.item_usage],
    [$.parameter_usage, $.attribute_usage],
    [$.parameter_usage, $.part_usage],
    [$.parameter_usage, $.action_usage],
    [$.parameter_usage, $.calc_usage],
    [$.parameter_usage, $.constraint_usage],
    [$.parameter_usage, $.occurrence_usage],
    [$.parameter_usage, $.reference_usage],
    [$.identification, $.do_statement],
    [$.identification, $.entry_statement],
    [$.identification, $.exit_statement],
    [$.accept_then_statement, $.identification],
    [$.accept_then_statement, $.identification, $.trigger_kind],
    [$.identification, $.trigger_kind],
    [$.first_statement, $.succession_statement],
    [$.first_statement, $.control_node, $.succession_statement],
    [$.control_node, $.succession_statement],
    [$.identification, $.message_statement],
    [$.message_statement, $.usage_declaration],
  ],

  rules: {
    // =========================================================================
    // Source File
    // =========================================================================
    source_file: ($) => repeat($._root_element),

    _root_element: ($) =>
      choice(
        $.package_definition,
        $.library_package,
        $._definition,
        $._usage,
        $.import_statement,
        $.alias_statement,
        $.dependency,
        $.comment_statement,
        $.documentation,
        $.connect_statement,
      ),

    // =========================================================================
    // Packages
    // =========================================================================
    package_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        'package',
        optional($.identification),
        $.package_body,
      ),

    library_package: ($) =>
      seq(
        optional('standard'),
        'library',
        repeat($.prefix_metadata),
        'package',
        optional($.identification),
        $.package_body,
      ),

    package_body: ($) =>
      choice(';', seq('{', repeat($._package_member), '}')),

    _package_member: ($) =>
      choice(
        $._definition,
        $._usage,
        $.actor_usage,
        $.import_statement,
        $.alias_statement,
        $.comment_statement,
        $.documentation,
        $.package_definition,
        $.library_package,
        $.dependency,
        $.allocate_statement,
        $.filter_statement,
        $.connect_statement,
        $.satisfy_statement,
        $.assert_statement,
        $.message_statement,
        $.shorthand_attribute,
      ),

    // Shorthand attribute assignment at package level: T1 = 10.0 [N * m];
    shorthand_attribute: ($) =>
      seq(
        $.name,
        choice(
          $.value_part,
          seq(':>', $.qualified_name),
        ),
        ';',
      ),

    // =========================================================================
    // Identification
    // =========================================================================
    identification: ($) =>
      choice(
        seq($.short_name, optional($.name)),
        seq('id', choice($.string_literal, $.name), optional($.name)),
        $.name,
      ),

    short_name: ($) => seq('<', $.name, '>'),

    name: ($) => choice($.identifier, $.quoted_name, alias('id', $.identifier)),

    quoted_name: ($) => seq('\'', /[^']*/, '\''),

    // =========================================================================
    // Definitions
    // =========================================================================
    _definition: ($) =>
      choice(
        $.part_definition,
        $.item_definition,
        $.port_definition,
        $.action_definition,
        $.state_definition,
        $.constraint_definition,
        $.requirement_definition,
        $.attribute_definition,
        $.enumeration_definition,
        $.connection_definition,
        $.interface_definition,
        $.allocation_definition,
        $.flow_definition,
        $.metadata_definition,
        $.use_case_definition,
        $.calc_definition,
        $.case_definition,
        $.occurrence_definition,
        $.verification_definition,
        $.analysis_definition,
        $.individual_definition,
        $.concern_definition,
        $.viewpoint_definition,
        $.view_definition,
        $.rendering_definition,
        $.generic_definition,
      ),

    generic_definition: ($) =>
      seq(
        repeat1($.prefix_metadata),
        optional($.visibility),
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    part_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional(choice('individual', 'variation')),
        'part',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    item_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('individual'),
        'item',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    port_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'port',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    action_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional(choice('individual', 'variation')),
        'action',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.action_body,
      ),

    state_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'state',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.state_body,
      ),

    constraint_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'constraint',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.constraint_body,
      ),

    requirement_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('variation'),
        'requirement',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.requirement_body,
      ),

    attribute_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('variation'),
        'attribute',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    enumeration_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        'enum',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.enumeration_body,
      ),

    connection_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'connection',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    interface_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'interface',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    allocation_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'allocation',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    metadata_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'metadata',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    flow_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'flow',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    use_case_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('variation'),
        'use',
        'case',
        optional('def'),
        optional($.identification),
        optional($.definition_specialization),
        $.requirement_body,
      ),

    calc_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'calc',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.action_body,
      ),

    case_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'case',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.requirement_body,
      ),

    case_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'case',
        optional($.usage_declaration),
        $.usage_body,
      ),

    occurrence_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('individual'),
        'occurrence',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    verification_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('variation'),
        'verification',
        optional('def'),
        optional($.identification),
        optional($.definition_specialization),
        $.action_body,
      ),

    analysis_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional(choice('individual', 'variation')),
        'analysis',
        optional('def'),
        optional($.identification),
        optional($.definition_specialization),
        $.action_body,
      ),

    individual_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        'individual',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    concern_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        'concern',
        optional('def'),
        optional($.identification),
        optional($.definition_specialization),
        $.requirement_body,
      ),

    viewpoint_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'viewpoint',
        optional('def'),
        optional($.identification),
        optional($.definition_specialization),
        $.requirement_body,
      ),

    view_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'view',
        'def',
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    rendering_definition: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'rendering',
        optional('def'),
        optional($.identification),
        optional($.definition_specialization),
        $.structural_body,
      ),

    // =========================================================================
    // Usages
    // =========================================================================
    _usage: ($) =>
      choice(
        $.part_usage,
        $.item_usage,
        $.port_usage,
        $.action_usage,
        $.state_usage,
        $.constraint_usage,
        $.requirement_usage,
        $.attribute_usage,
        $.connection_usage,
        $.interface_usage,
        $.allocation_usage,
        $.reference_usage,
        $.flow_usage,
        $.metadata_usage,
        $.parameter_usage,
        $.exhibit_usage,
        $.calc_usage,
        $.case_usage,
        $.analysis_usage,
        $.use_case_usage,
        $.occurrence_usage,
        $.verification_usage,
        $.individual_usage,
        $.timeslice_usage,
        $.snapshot_usage,
        $.event_occurrence_usage,
        $.event_usage,
        $.view_usage,
        $.rendering_usage,
        $.enumeration_usage,
        $.concern_usage,
        $.viewpoint_usage,
        $.feature_usage,
        $.generic_usage,
      ),

    // Shorthand feature usage: name : Type; or name :> Specialization = expr; (no keyword)
    feature_usage: ($) =>
      prec(-1, seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        $.identification,
        choice($.typing_part, $.specialization_part),
        repeat(choice($.multiplicity, $.relationship_part)),
        optional($.value_part),
        $.usage_body,
      )),

    generic_usage: ($) =>
      prec.dynamic(-1, seq(
        optional('abstract'),
        repeat1($.prefix_metadata),
        optional($.visibility),
        optional($.usage_declaration),
        $.usage_body,
      )),

    parameter_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        $.port_direction,
        optional(choice('part', 'individual', 'ref', 'calc', 'attribute', 'item', 'occurrence', 'action', 'constraint')),
        optional($.usage_declaration),
        $.usage_body,
      ),

    part_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional(choice('then', 'first')),
        optional(choice('snapshot', 'timeslice', 'variation', 'individual')),
        optional('ref'),
        'part',
        optional($.usage_declaration),
        $.usage_body,
      ),

    item_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional($.port_direction),
        optional('ref'),
        optional('individual'),
        'item',
        optional($.usage_declaration),
        $.usage_body,
      ),

    port_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional(choice('variation', 'variant')),
        optional($.port_direction),
        optional('ref'),
        'port',
        choice(
          seq(optional($.usage_declaration), $.usage_body),
          seq($.identification, ';'),
        ),
      ),

    port_direction: ($) => choice('in', 'out', 'inout'),

    action_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional(choice('variation', 'variant')),
        optional(choice('first', 'then', 'loop')),
        optional('individual'),
        optional('ref'),
        'action',
        optional($.usage_declaration),
        optional(choice('terminate', $.accept_part, $.send_part)),
        $.action_body,
      ),

    accept_part: ($) =>
      seq('accept', choice($.qualified_name, optional($.usage_declaration)), optional(seq('via', $.feature_chain))),

    send_part: ($) =>
      choice(
        seq('send', $._expression, choice(seq('to', $.feature_chain), seq('via', $.feature_chain))),
        seq('send', optional(seq('via', $.feature_chain, 'to', $.feature_chain))),
      ),

    action_body: ($) =>
      choice(
        ';',
        seq(
          optional(seq('while', $._expression)),
          '{',
          repeat(choice($._behavioral_member, $.opaque_body, $.textual_representation)),
          optional($._expression),
          '}',
          optional(seq('until', $._expression, ';')),
        ),
      ),

    state_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'state',
        optional($.usage_declaration),
        optional('parallel'),
        $.state_body,
      ),

    constraint_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'constraint',
        optional($.usage_declaration),
        $.constraint_body,
      ),

    requirement_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('variation'),
        optional('ref'),
        'requirement',
        optional($.usage_declaration),
        $.requirement_body,
      ),

    attribute_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('derived'),
        optional('constant'),
        optional('variation'),
        optional($.port_direction),
        optional('ref'),
        'attribute',
        choice(
          seq(optional($.usage_declaration), optional('ordered'), $.usage_body),
          seq(':>>', $.feature_chain, optional($.value_part), ';'),
        ),
      ),

    connection_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'connection',
        optional($.usage_declaration),
        optional($.connection_part),
        $.usage_body,
      ),

    connection_part: ($) =>
      choice(
        seq(
          'connect',
          $.connect_endpoint,
          'to',
          $.connect_endpoint,
        ),
        seq(
          'connect',
          '(',
          commaSep1($.nary_connect_endpoint),
          ')',
        ),
      ),

    nary_connect_endpoint: ($) =>
      choice(
        seq($.name, '::>', $.feature_chain),
        $.feature_chain,
      ),

    interface_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'interface',
        optional($.usage_declaration),
        optional($.interface_part),
        $.usage_body,
      ),

    interface_part: ($) =>
      choice(
        seq(
          optional('connect'),
          $.interface_endpoint,
          'to',
          $.interface_endpoint,
        ),
        seq(
          'connect',
          '(',
          commaSep1($.interface_endpoint),
          ')',
        ),
      ),

    interface_endpoint: ($) =>
      choice(
        seq(optional($.multiplicity), $.name, '::>', $.feature_chain),
        seq(optional($.multiplicity), $.feature_chain),
      ),

    allocation_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'allocation',
        optional($.usage_declaration),
        optional($.allocation_part),
        $.usage_body,
      ),

    allocation_part: ($) =>
      choice(
        seq('allocate', $._allocate_endpoint, 'to', $._allocate_endpoint),
        seq('allocate', '(', commaSep1($.nary_allocation_endpoint), ')'),
      ),

    nary_allocation_endpoint: ($) =>
      choice(
        seq($.name, '::>', $.feature_chain),
        $.feature_chain,
      ),

    reference_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('constant'),
        optional($.port_direction),
        'ref',
        optional('individual'),
        repeat($.prefix_metadata),
        optional($.usage_declaration),
        $.usage_body,
      ),

    flow_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'flow',
        optional($.usage_declaration),
        optional($.flow_part),
        $.usage_body,
      ),

    flow_part: ($) =>
      seq(
        optional(seq('of', choice(
          seq($.name, $.typing_part, optional($.multiplicity)),
          seq($.qualified_name, optional($.multiplicity)),
        ))),
        'from',
        $.feature_chain,
        'to',
        $.feature_chain,
      ),

    metadata_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        choice('@', 'metadata'),
        choice(
          seq($.identification, $.typing_part),
          $.qualified_name,
        ),
        optional(seq('about', commaSep1($.qualified_name))),
        $.usage_body,
      ),

    exhibit_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        'exhibit',
        optional('state'),
        choice(
          seq(choice($.feature_chain, $.qualified_name), optional(seq('redefines', $.name)), $.usage_body),
          seq(optional($.usage_declaration), optional('parallel'), $.usage_body),
        ),
      ),

    calc_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'calc',
        optional($.usage_declaration),
        $.usage_body,
      ),

    analysis_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('individual'),
        optional('ref'),
        'analysis',
        optional($.usage_declaration),
        $.usage_body,
      ),

    use_case_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('then'),
        optional('ref'),
        'use',
        'case',
        optional($.usage_declaration),
        $.usage_body,
      ),

    occurrence_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('constant'),
        optional('individual'),
        optional('ref'),
        'occurrence',
        optional($.usage_declaration),
        $.usage_body,
      ),

    verification_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'verification',
        optional($.usage_declaration),
        $.usage_body,
      ),

    individual_usage: ($) =>
      prec(-1, seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        'individual',
        optional($.usage_declaration),
        $.usage_body,
      )),

    timeslice_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('then'),
        optional('individual'),
        'timeslice',
        optional('item'),
        optional($.usage_declaration),
        optional('ordered'),
        $.usage_body,
      ),

    snapshot_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('then'),
        optional('individual'),
        'snapshot',
        optional($.usage_declaration),
        $.usage_body,
      ),

    event_occurrence_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional($.port_direction),
        optional('then'),
        'event',
        'occurrence',
        optional($.usage_declaration),
        $.usage_body,
      ),

    event_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('then'),
        'event',
        choice(
          seq(
            $.identification,
            optional($.typing_part),
            optional($.value_part),
          ),
          seq(
            choice($.feature_chain, $.qualified_name),
            optional($.multiplicity),
            optional($.relationship_part),
          ),
        ),
        ';',
      ),

    view_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'view',
        optional($.usage_declaration),
        $.usage_body,
      ),

    rendering_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        optional('ref'),
        'rendering',
        optional($.usage_declaration),
        $.structural_body,
      ),

    enumeration_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        'enum',
        optional($.usage_declaration),
        $.usage_body,
      ),

    concern_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'concern',
        optional($.usage_declaration),
        $.requirement_body,
      ),

    viewpoint_usage: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('abstract'),
        'viewpoint',
        optional($.usage_declaration),
        $.requirement_body,
      ),

    // =========================================================================
    // Usage Declaration
    // =========================================================================
    usage_declaration: ($) =>
      choice(
        // Must have at least identification
        seq(
          $.identification,
          optional($.multiplicity),
          repeat(choice($.multiplicity, $.relationship_part, $.nonunique_modifier)),
          optional($.typing_part),
          repeat(choice($.multiplicity, $.relationship_part, $.nonunique_modifier)),
          optional($.value_part),
        ),
        // Or just typing (anonymous typed usage)
        seq(
          $.typing_part,
          repeat(choice($.multiplicity, $.relationship_part, $.nonunique_modifier)),
          optional($.value_part),
        ),
        // Or just specialization without typing
        prec.dynamic(100, seq(
          $.specialization_part,
          optional($.typing_part),
          repeat(choice($.multiplicity, $.relationship_part, $.nonunique_modifier)),
          optional($.value_part),
        )),
        // Or just a relationship (e.g., "part redefines cyl")
        seq(
          $.relationship_part,
          repeat(choice($.multiplicity, $.relationship_part, $.nonunique_modifier)),
          optional($.typing_part),
          repeat(choice($.multiplicity, $.relationship_part, $.nonunique_modifier)),
          optional($.value_part),
        ),
        // Or just multiplicity
        seq(
          $.multiplicity,
          repeat(choice($.multiplicity, $.relationship_part, $.nonunique_modifier)),
          optional($.value_part),
        ),
        // Or just value
        $.value_part,
      ),

    // =========================================================================
    // Typing (: Type)
    // =========================================================================
    typing_part: ($) =>
      seq(':', optional('~'), commaSep1($.qualified_name)),

    // =========================================================================
    // Definition Specialization (for definitions: :> or specializes)
    // =========================================================================
    definition_specialization: ($) =>
      choice(
        seq(':>', commaSep1($.qualified_name)),
        seq('specializes', commaSep1($.qualified_name)),
      ),

    // =========================================================================
    // Specialization (for usages without typing - lower precedence)
    // =========================================================================
    specialization_part: ($) =>
      prec(1, choice(
        seq(':>', commaSep1(choice($.feature_chain, $.qualified_name))),
        seq('specializes', commaSep1(choice($.feature_chain, $.qualified_name))),
      )),

    // =========================================================================
    // Relationship Parts (can follow typing or multiplicity - higher precedence)
    // =========================================================================
    relationship_part: ($) =>
      prec.left(2, choice(
        $.specialization_part,
        $.subsetting_part,
        $.redefinition_part,
        $.reference_part,
        $.defined_by_part,
        $.crosses_part,
      )),

    defined_by_part: ($) =>
      seq('defined', 'by', $.qualified_name),

    subsetting_part: ($) =>
      seq('subsets', commaSep1(choice($.qualified_name, $.feature_chain))),

    redefinition_part: ($) =>
      prec.right(seq(
        choice(':>>', 'redefines'),
        commaSep1(choice(
          seq($.qualified_name, repeat1(seq('.', $.name))),
          $.feature_chain,
          $.qualified_name,
        )),
        optional($.typing_part),
        optional($.value_part),
      )),

    reference_part: ($) =>
      seq(choice('::>', 'references'), commaSep1(choice($.feature_chain, $.qualified_name))),

    crosses_part: ($) => seq('crosses', $.feature_chain),

    // =========================================================================
    // Multiplicity
    // =========================================================================
    multiplicity: ($) =>
      seq(
        '[',
        optional(choice(
          seq($.multiplicity_bound, '..', choice($.multiplicity_bound, '*')),
          $.multiplicity_bound,
          '*',
        )),
        ']',
      ),

    multiplicity_bound: ($) => choice($.integer_literal, $.identifier),

    nonunique_modifier: ($) => choice('nonunique', 'ordered'),

    // =========================================================================
    // Value Part
    // =========================================================================
    value_part: ($) =>
      seq(
        choice('=', ':=', seq('default', '='), seq('default', ':='), 'default'),
        $._expression,
      ),

    // =========================================================================
    // Bodies
    // =========================================================================
    definition_body: ($) =>
      choice(
        ';',
        seq('{', repeat(choice($._definition_member, $.opaque_body, $.textual_representation)), '}'),
      ),

    opaque_body: ($) =>
      seq('language', $.string_literal, $.block_comment_body),

    textual_representation: ($) =>
      seq(
        'rep',
        optional($.identification),
        'language',
        $.string_literal,
        $.block_comment_body,
      ),

    _definition_member: ($) =>
      choice(
        $._definition,
        $._usage,
        $.end_usage,
        $.connect_statement,
        $.bind_statement,
        $.flow_statement,
        $.stream_statement,
        $.succession_statement,
        $.first_statement,
        $.if_then_statement,
        $.then_if_block,
        $.done_statement,
        $.control_node,
        $.then_succession,
        $.perform_statement,
        $.terminate_statement,
        $.for_loop,
        $.assign_statement,
        $.send_statement,
        $.transition_statement,
        $.entry_statement,
        $.do_statement,
        $.exit_statement,
        $.accept_then_statement,
        $.import_statement,
        $.alias_statement,
        $.comment_statement,
        $.documentation,
        $.expression_statement,
        $.subject_statement,
        $.actor_usage,
        $.objective_usage,
        $.allocate_statement,
        $.variant_usage,
        $.message_statement,
        $.specialization_statement,
        $.stakeholder_usage,
        $.frame_statement,
        $.expose_statement,
        $.render_statement,
        $.satisfy_statement,
        $.filter_statement,
      ),

    usage_body: ($) =>
      choice(';', seq('{', repeat($._usage_member), '}')),

    _usage_member: ($) =>
      choice(
        $._definition,
        $._usage,
        $.end_usage,
        $.connect_statement,
        $.bind_statement,
        $.flow_statement,
        $.stream_statement,
        $.succession_statement,
        $.first_statement,
        $.if_then_statement,
        $.then_if_block,
        $.done_statement,
        $.control_node,
        $.then_succession,
        $.perform_statement,
        $.terminate_statement,
        $.for_loop,
        $.assign_statement,
        $.send_statement,
        $.transition_statement,
        $.entry_statement,
        $.do_statement,
        $.exit_statement,
        $.accept_then_statement,
        $.comment_statement,
        $.documentation,
        $.redefines_statement,
        $.expression_statement,
        $.assert_statement,
        $.assume_statement,
        $.require_statement,
        $.subject_statement,
        $.satisfy_statement,
        $.return_statement,
        $.actor_usage,
        $.objective_usage,
        $.verify_statement,
        $.allocate_statement,
        $.import_statement,
        $.alias_statement,
        $.variant_usage,
        $.message_statement,
        $.include_statement,
        $.expose_statement,
        $.render_statement,
        $.filter_statement,
        $.textual_representation,
        $.specialization_statement,
      ),

    // =========================================================================
    // Context-Specific Members (TD-1)
    // =========================================================================

    // Base structural members - valid in part, item, port, connection, etc.
    _structural_member: ($) =>
      choice(
        $._definition,
        $._usage,
        $.package_definition,
        $.end_usage,
        $.connect_statement,
        $.bind_statement,
        $.flow_statement,
        $.stream_statement,
        $.succession_statement,
        $.first_statement,
        $.then_succession,
        $.message_statement,
        $.comment_statement,
        $.documentation,
        $.import_statement,
        $.allocate_statement,
        $.alias_statement,
        $.redefines_statement,
        $.expression_statement,
        $.variant_usage,
        $.variation_usage,
        $.expose_statement,
        $.render_statement,
        $.filter_statement,
        $.specialization_statement,
        $.stakeholder_usage,
        $.frame_statement,
        $.assert_statement,
        $.assume_statement,
        $.satisfy_statement,
        $.perform_statement,
        $.shorthand_attribute,
        $.dependency,
      ),

    // Behavioral members - valid in action (adds control flow to structural)
    _behavioral_member: ($) =>
      choice(
        $._structural_member,
        $.if_then_statement,
        $.then_if_block,
        $.if_else_block,
        $.done_statement,
        $.else_statement,
        $.control_node,
        $.first_statement,
        $.perform_statement,
        $.terminate_statement,
        $.for_loop,
        $.while_loop,
        $.loop_until,
        $.assign_statement,
        $.send_statement,
        $.accept_then_statement,
        $.return_statement,
        $.subject_statement,
        $.objective_usage,
      ),

    // State members - valid in state (adds entry/do/exit/transition to behavioral)
    _state_member: ($) =>
      choice(
        $._behavioral_member,
        $.entry_statement,
        $.do_statement,
        $.exit_statement,
        $.transition_statement,
      ),

    // Requirement members - valid in requirement/use case (structural + req-specific)
    _requirement_member: ($) =>
      choice(
        $._structural_member,
        $.subject_statement,
        $.actor_usage,
        $.objective_usage,
        $.require_statement,
        $.verify_statement,
        $.include_statement,
        $.return_statement,
      ),

    // =========================================================================
    // Context-Specific Bodies (TD-1)
    // =========================================================================

    structural_body: ($) =>
      choice(';', seq('{', repeat($._structural_member), '}')),

    constraint_body: ($) =>
      choice(
        ';',
        seq('{', repeat(choice($._structural_member, $.return_statement, $.opaque_body, $.textual_representation)), optional($._expression), '}'),
      ),

    state_body: ($) =>
      choice(';', seq('{', repeat($._state_member), '}')),

    requirement_body: ($) =>
      choice(';', seq('{', repeat($._requirement_member), '}')),

    enumeration_body: ($) =>
      choice(';', seq('{', repeat(choice($.enumeration_member, $.documentation, $.comment_statement)), '}')),

    enumeration_member: ($) =>
      seq(
        repeat($.prefix_metadata),
        optional($.visibility),
        optional('enum'),
        $.name,
        optional($.typing_part),
        optional($.value_part),
        choice(
          ';',
          seq('{', repeat($._enum_member_content), '}'),
        ),
      ),

    _enum_member_content: ($) =>
      choice(
        $.redefinition_statement,
        $.redefines_statement,
        $._usage,
        $.comment_statement,
        $.documentation,
      ),

    redefinition_statement: ($) =>
      seq(
        ':>>',
        $.qualified_name,
        optional($.value_part),
        ';',
      ),

    // =========================================================================
    // End Usage (connection endpoints)
    // =========================================================================
    end_usage: ($) =>
      seq(
        'end',
        repeat($.prefix_metadata),
        optional($.identification),
        optional($.multiplicity),
        optional(choice('nonunique', 'ordered')),
        optional(choice('part', 'port', 'ref', 'item', 'occurrence')),
        optional($.usage_declaration),
        $.usage_body,
      ),


    // =========================================================================
    // Connect Statement (binary or n-ary connection)
    // =========================================================================
    connect_statement: ($) =>
      prec.dynamic(10, choice(
        seq(
          repeat($.prefix_metadata),
          'connect',
          $.connect_endpoint,
          'to',
          $.connect_endpoint,
          $.usage_body,
        ),
        seq(
          repeat($.prefix_metadata),
          'connect',
          '(',
          commaSep1($.nary_connect_endpoint),
          ')',
          $.usage_body,
        ),
      )),

    connect_endpoint: ($) =>
      seq(
        optional($.multiplicity),
        $.feature_chain,
        optional(seq('references', $.feature_chain)),
      ),

    // =========================================================================
    // Bind Statement (binding connector)
    // =========================================================================
    bind_statement: ($) =>
      seq(
        'bind',
        $.feature_chain,
        '=',
        choice($.qualified_name, $.feature_chain),
        choice(';', seq('{', repeat(choice($.comment_statement, $.documentation)), '}')),
      ),

    // =========================================================================
    // Flow Statement (simplified flow)
    // =========================================================================
    flow_statement: ($) =>
      seq(
        optional('succession'),
        'flow',
        optional($.identification),
        choice(
          seq('from', $.feature_chain, 'to', $.feature_chain),
          seq($.feature_chain, 'to', $.feature_chain),
        ),
        $.usage_body,
      ),

    stream_statement: ($) =>
      seq(
        'stream',
        choice(
          seq($.name, 'from', $.feature_chain, 'to', $.feature_chain),
          seq($.feature_chain, 'to', $.feature_chain),
        ),
        ';',
      ),

    // =========================================================================
    // Succession Statement (action ordering)
    // =========================================================================
    succession_statement: ($) =>
      seq(
        optional($.visibility),
        'succession',
        optional($.identification),
        optional($.typing_part),
        optional($.multiplicity),
        'first',
        optional($.multiplicity),
        $.feature_chain,
        optional(seq('if', $._expression)),
        'then',
        optional($.multiplicity),
        $.feature_chain,
        $.usage_body,
      ),

    // =========================================================================
    // If-Then Statement (guard succession)
    // =========================================================================
    if_then_statement: ($) =>
      seq(
        'if',
        $._expression,
        'then',
        $.name,
        ';',
      ),

    // =========================================================================
    // Then-If Block (conditional control)
    // =========================================================================
    then_if_block: ($) =>
      prec.right(seq(
        'then',
        'if',
        $._expression,
        '{',
        repeat($._usage_member),
        '}',
        optional(seq('else', '{', repeat($._usage_member), '}')),
      )),

    // =========================================================================
    // If-Else Block (structured control: if { } else if { } else { })
    // =========================================================================
    if_else_block: ($) =>
      prec.right(seq(
        'if',
        $._expression,
        '{',
        repeat($._behavioral_member),
        '}',
        repeat(seq('else', 'if', $._expression, '{', repeat($._behavioral_member), '}')),
        optional(seq('else', '{', repeat($._behavioral_member), '}')),
      )),

    // =========================================================================
    // Control Nodes (start, done, decide, merge, fork, join)
    // =========================================================================
    done_statement: ($) =>
      seq(
        optional(choice('then', 'else')),
        'done',
        ';',
      ),

    else_statement: ($) =>
      seq('else', $.name, ';'),

    control_node: ($) =>
      seq(
        optional('then'),
        choice(
          seq('decide', optional($.name)),
          seq('merge', optional($.name)),
          seq('fork', optional($.name)),
          seq('join', optional($.name)),
        ),
        choice(';', seq('{', repeat($._behavioral_member), '}')),
      ),

    first_statement: ($) =>
      choice(
        seq('first', $.name, ';'),
        seq('first', $.feature_chain, 'then', $.feature_chain, $.usage_body),
      ),

    then_succession: ($) =>
      choice(
        seq('then', $.name, ';'),
        seq('then', 'accept', $.trigger_kind, ';'),
        seq('then', 'action', optional($.usage_declaration), $.action_body),
        seq('then', 'state', optional($.usage_declaration), $.state_body),
        seq('then', 'for', $.name, optional($.typing_part), 'in', choice($.feature_chain, $.collection_expression), '{', repeat($._behavioral_member), '}'),
        seq('then', 'while', $._expression, '{', repeat($._behavioral_member), '}'),
      ),

    // =========================================================================
    // Perform Statement
    // =========================================================================
    perform_statement: ($) =>
      seq(
        optional(choice('variation', 'variant')),
        'perform',
        optional('action'),
        choice(
          seq(choice($.feature_chain, $.qualified_name), optional(choice(seq(':>>', $.qualified_name), seq('redefines', $.name)))),
          optional($.usage_declaration),
        ),
        optional($.multiplicity),
        optional('ordered'),
        optional(seq('references', $.feature_chain)),
        choice(';', seq('{', repeat($._behavioral_member), '}')),
      ),

    // =========================================================================
    // Terminate Statement
    // =========================================================================
    terminate_statement: ($) =>
      seq(
        'terminate',
        $.feature_chain,
        ';',
      ),

    // =========================================================================
    // For Loop
    // =========================================================================
    for_loop: ($) =>
      seq(
        'for',
        $.name,
        optional($.typing_part),
        'in',
        $._expression,
        '{',
        repeat($._behavioral_member),
        '}',
      ),

    while_loop: ($) =>
      seq(
        'while',
        $._expression,
        '{',
        repeat($._behavioral_member),
        '}',
        optional(seq('until', $._expression, ';')),
      ),

    loop_until: ($) =>
      seq(
        'loop',
        '{',
        repeat($._behavioral_member),
        '}',
        optional(seq('until', $._expression, ';')),
      ),

    // =========================================================================
    // Assign Statement
    // =========================================================================
    assign_statement: ($) =>
      seq(
        optional('then'),
        'assign',
        $.feature_chain,
        ':=',
        $._expression,
        ';',
      ),

    // =========================================================================
    // Send Statement
    // =========================================================================
    send_statement: ($) =>
      seq(
        optional('then'),
        'send',
        $._expression,
        choice(seq('to', $.feature_chain), seq('via', $.feature_chain)),
        ';',
      ),

    // =========================================================================
    // Transition Statement (state machine)
    // =========================================================================
    transition_statement: ($) =>
      choice(
        seq(
          'transition',
          optional($.name),
          'first',
          $.feature_chain,
          optional(seq('accept', $.trigger_kind, optional(seq('via', $.feature_chain)))),
          optional(seq('if', $._expression)),
          optional(seq('do', $._transition_action)),
          'then',
          $.feature_chain,
          $.usage_body,
        ),
        seq(
          'transition',
          optional($.name),
          $.feature_chain,
          'then',
          $.feature_chain,
          $.usage_body,
        ),
      ),

    // =========================================================================
    // Entry/Do/Exit Statements (state machine)
    // =========================================================================
    entry_statement: ($) =>
      choice(
        seq('entry', ';'),
        seq('entry', 'action', $.usage_declaration, ';'),
        seq('entry', $.feature_chain, ';'),
        seq('entry', optional('action'), optional($.usage_declaration), '{', repeat($._usage_member), '}'),
        seq('entry', 'assign', $.feature_chain, ':=', $._expression, ';'),
        seq('entry', 'send', $._expression, choice('to', 'via'), $.feature_chain, ';'),
      ),

    do_statement: ($) =>
      choice(
        seq('do', optional('action'), optional($.usage_declaration), '{', repeat($._usage_member), '}'),
        seq('do', 'action', $.usage_declaration, ';'),
        seq('do', 'action', $.feature_chain, ';'),
        seq('do', $.feature_chain, ';'),
        seq('do', $._expression, ';'),
        seq('do', 'send', $._expression, choice('to', 'via'), $.feature_chain, ';'),
        seq('do', 'assign', $.feature_chain, ':=', $._expression, ';'),
      ),

    exit_statement: ($) =>
      choice(
        seq('exit', optional('action'), optional($.usage_declaration), '{', repeat($._usage_member), '}'),
        seq('exit', 'action', $.usage_declaration, ';'),
        seq('exit', 'send', $._expression, choice('to', 'via'), $.feature_chain, ';'),
        seq('exit', $.feature_chain, ';'),
      ),

    // =========================================================================
    // Accept-Then Statement (state trigger)
    // =========================================================================
    accept_then_statement: ($) =>
      choice(
        seq(
          'accept',
          $.trigger_kind,
          optional(seq('via', $.feature_chain)),
          optional(seq('if', $._expression)),
          optional(seq('do', $._transition_action)),
          'then',
          $.name,
          ';',
        ),
        seq('accept', $.qualified_name, optional(seq('via', $.feature_chain)), ';'),
        seq('accept', $.identification, $.typing_part, ';'),
      ),

    trigger_kind: ($) =>
      choice(
        seq(optional(seq($.name, ':')), $.qualified_name),
        seq($.name, $.typing_part),
        seq('at', $._expression),
        seq('when', $._expression),
        seq('after', $._expression),
        seq($.name, 'after', $._expression),
      ),

    _transition_action: ($) =>
      choice(
        seq('send', optional('new'), $._expression, choice(seq('to', $.feature_chain), seq('via', $.feature_chain))),
        seq('action', optional($.usage_declaration), optional(seq('{', repeat($._usage_member), '}'))),
        $.feature_chain,
      ),

    expression_statement: ($) =>
      prec(-2, seq($._expression, ';')),

    redefines_statement: ($) =>
      choice(
        seq('redefines', commaSep1($.qualified_name), optional($.value_part), ';'),
        seq('redefines', commaSep1($.qualified_name), optional($.typing_part), optional($.value_part), ';'),
        seq(':>>', commaSep1($.feature_chain), optional($.value_part), ';'),
        seq(':>>', commaSep1($.feature_chain), optional($.typing_part), optional($.multiplicity), optional($.value_part), ';'),
        seq(':>>', commaSep1($.feature_chain), optional($.value_part), $.usage_body),
        seq(':>>', commaSep1($.feature_chain), optional($.typing_part), optional($.value_part), $.usage_body),
        seq($.name, ':>>', commaSep1($.feature_chain), optional($.value_part), ';'),
        seq($.name, ':>>', commaSep1($.feature_chain), optional($.typing_part), optional($.multiplicity), optional($.value_part), ';'),
        seq($.name, optional($.value_part), seq('{', repeat($._usage_member), '}')),
      ),

    assert_statement: ($) =>
      choice(
        seq(
          optional($.visibility),
          'assert',
          optional('constraint'),
          choice(
            seq(
              $.identification,
              optional($.typing_part),
              $.usage_body,
            ),
            seq($.qualified_name, $.usage_body),
            $.constraint_body,
          ),
        ),
        seq('assert', 'not', $.identification, $.usage_body),
        seq('assert', 'satisfy', $.qualified_name, optional(seq('by', $.feature_chain)), ';'),
        seq('assert', 'not', 'satisfy', $.qualified_name, optional(seq('by', $.feature_chain)), ';'),
      ),

    assume_statement: ($) =>
      seq(
        'assume',
        repeat($.prefix_metadata),
        optional('constraint'),
        choice(
          seq(
            $.identification,
            optional($.typing_part),
            $.usage_body,
          ),
          seq($.qualified_name, $.usage_body),
          $.constraint_body,
        ),
      ),

    require_statement: ($) =>
      seq(
        'require',
        repeat($.prefix_metadata),
        optional('constraint'),
        choice(
          seq($.feature_chain, ';'),
          seq($.feature_chain, $.usage_body),
          $.constraint_body,
        ),
      ),

    subject_statement: ($) =>
      prec(1, seq('subject', optional($.usage_declaration), choice(';', $.usage_body))),

    satisfy_statement: ($) =>
      prec(1, choice(
        seq('satisfy', $.qualified_name, optional(seq('by', $.feature_chain)), choice(';', seq('{', repeat($._requirement_member), '}'))),
        seq('not', 'satisfy', $.qualified_name, optional(seq('by', $.feature_chain)), ';'),
        seq(
          'satisfy',
          'requirement',
          $.usage_declaration,
          optional(seq('by', $.feature_chain)),
          choice(';', seq('{', repeat($._usage_member), '}')),
        ),
      )),

    return_statement: ($) =>
      choice(
        seq('return', $.qualified_name, ';'),
        seq('return', 'attribute', $.usage_declaration, $.usage_body),
        seq('return', optional(choice('part', 'ref')), optional($.usage_declaration), $.usage_body),
      ),

    actor_usage: ($) =>
      seq('actor', optional($.usage_declaration), $.usage_body),

    objective_usage: ($) =>
      seq('objective', optional($.usage_declaration), $.usage_body),

    verify_statement: ($) =>
      choice(
        seq('verify', $.feature_chain, choice(';', seq('{', repeat($._usage_member), '}'))),
        seq('verify', 'requirement', optional($.usage_declaration), ';'),
      ),

    allocate_statement: ($) =>
      seq('allocate', $._allocate_endpoint, 'to', $._allocate_endpoint, choice(';', seq('{', repeat($._usage_member), '}'))),

    _allocate_endpoint: ($) =>
      choice(
        seq($.name, '::>', $.feature_chain),
        $.feature_chain,
      ),

    filter_statement: ($) =>
      seq('filter', $._expression, ';'),

    specialization_statement: ($) =>
      seq(':>', $.qualified_name, optional($.typing_part), optional($.value_part), ';'),

    stakeholder_usage: ($) =>
      seq('stakeholder', optional($.usage_declaration), $.usage_body),

    frame_statement: ($) =>
      choice(
        seq('frame', optional('concern'), $.name, $.typing_part, ';'),
        seq('frame', optional('concern'), $.qualified_name, ';'),
        seq('concern', $.qualified_name, ';'),
      ),

    expose_statement: ($) =>
      seq('expose', $.import_reference, ';'),

    render_statement: ($) =>
      seq('render', $.qualified_name, $.usage_body),

    variant_usage: ($) =>
      prec(1, seq('variant', optional(choice('attribute', 'part', 'action', 'requirement', seq('use', 'case'))), optional($.usage_declaration), choice($.usage_body, ';'))),

    variation_usage: ($) =>
      seq('variation', optional($.usage_declaration), $.usage_body),

    message_statement: ($) =>
      seq(
        optional('abstract'),
        optional('then'),
        'message',
        choice(
          seq(
            $.name,
            optional(seq('of', optional($.name), optional($.typing_part), optional($.multiplicity), optional($.value_part))),
            optional(seq('from', $.feature_chain, 'to', $.feature_chain)),
            ';',
          ),
          seq(
            'of', optional($.name), optional($.typing_part),
            'from', $.feature_chain, 'to', $.feature_chain,
            ';',
          ),
          seq(
            $.relationship_part,
            optional($.typing_part),
            optional($.value_part),
            $.usage_body,
          ),
          seq(
            $.typing_part,
            'from', $.feature_chain, 'to', $.feature_chain,
            ';',
          ),
          seq(
            $.usage_declaration,
            $.usage_body,
          ),
        ),
      ),

    include_statement: ($) =>
      seq(
        optional('then'),
        'include',
        optional(seq('use', 'case')),
        choice(
          seq(optional($.usage_declaration), $.usage_body),
          seq($.feature_chain, ';'),
        ),
      ),

    feature_chain: ($) =>
      prec.left(1, seq($.name, repeat(seq(choice('.', '::'), $.name)))),

    // =========================================================================
    // Import and Alias
    // =========================================================================
    import_statement: ($) =>
      seq(
        optional($.visibility),
        'import',
        optional('all'),
        $.import_reference,
        choice(';', seq('{', repeat(choice($.comment_statement, $.documentation)), '}')),
      ),

    import_reference: ($) =>
      choice(
        $.wildcard_import,
        $.qualified_name,
      ),

    wildcard_import: ($) =>
      seq(
        $.name,
        repeat(seq('::', $.name)),
        '::',
        choice('*', '**'),
        optional(seq('::', '**')),
        optional(seq('[', $._expression, ']')),
      ),

    alias_statement: ($) =>
      choice(
        seq(
          optional($.visibility),
          'alias',
          optional($.identification),
          'for',
          $.qualified_name,
          choice(';', seq('{', repeat($._definition_member), '}')),
        ),
        seq(
          optional($.visibility),
          'alias',
          $.qualified_name,
          'as',
          $.name,
          choice(';', seq('{', repeat($._definition_member), '}')),
        ),
      ),

    // =========================================================================
    // Dependencies
    // =========================================================================
    dependency: ($) =>
      seq(
        repeat($.prefix_metadata),
        'dependency',
        optional($.identification),
        choice(
          seq('from', commaSep1($.qualified_name), 'to', commaSep1($.qualified_name)),
          seq('to', commaSep1($.qualified_name)),
        ),
        choice(';', seq('{', repeat($.annotation), '}')),
      ),

    // =========================================================================
    // Comments and Documentation
    // =========================================================================
    comment_statement: ($) =>
      choice(
        seq(
          'comment',
          optional($.identification),
          optional(seq('about', commaSep1($.qualified_name))),
          optional(seq('locale', $.string_literal)),
          $.block_comment_body,
        ),
        seq('locale', $.string_literal, $.block_comment_body),
      ),

    documentation: ($) =>
      seq(
        optional($.visibility),
        'doc',
        optional($.identification),
        optional(seq('locale', $.string_literal)),
        optional($.block_comment_body),
      ),

    block_comment_body: ($) => /\/\*[^*]*\*+([^/*][^*]*\*+)*\//,

    // =========================================================================
    // Metadata
    // =========================================================================
    prefix_metadata: ($) =>
      seq('#', $.qualified_name),

    annotation: ($) => $.qualified_name,

    // =========================================================================
    // Visibility
    // =========================================================================
    visibility: ($) => choice('public', 'private', 'protected'),

    // =========================================================================
    // Expressions
    // =========================================================================
    _expression: ($) =>
      choice(
        $.literal,
        $.qualified_name,
        $.parenthesized_expression,
        $.binary_expression,
        $.unary_expression,
        $.feature_chain_expression,
        $.collection_expression,
        $.invocation_expression,
        $.new_expression,
        $.measurement_expression,
        $.function_call_expression,
        $.metadata_access_expression,
        $.meta_expression,
        $.select_expression,
        $.index_expression,
        $.range_expression,
        $.conditional_expression,
        $.cast_expression,
      ),

    conditional_expression: ($) =>
      seq(
        'if',
        $._expression,
        '?',
        $._expression,
        'else',
        $._expression,
      ),

    select_expression: ($) =>
      prec.left(4, seq($._expression, '.?', '{', repeat($._select_body_member), '}')),

    _select_body_member: ($) =>
      choice(
        $.parameter_usage,
        $.attribute_usage,
        $._expression,
      ),

    index_expression: ($) =>
      prec.left(5, seq($._expression, '#', '(', $._expression, ')')),

    range_expression: ($) =>
      prec.left(2, seq($._expression, '..', $._expression)),

    measurement_expression: ($) =>
      prec.left(5, choice(
        seq($._expression, '[', $._unit_expression, ']'),
        seq($._expression, '@', '[', $._unit_expression, ']'),
      )),

    _unit_expression: ($) =>
      choice(
        $.unit_binary,
        $.unit_exponent,
        $.qualified_name,
        $.integer_literal,
      ),

    unit_binary: ($) =>
      prec.left(seq($._unit_expression, choice('*', '/'), $._unit_expression)),

    unit_exponent: ($) =>
      prec.left(2, seq($.qualified_name, choice('**', '^'), $.integer_literal)),

    new_expression: ($) =>
      seq('new', $.qualified_name, '(', optional(seq($._expression, repeat(seq(',', $._expression)))), ')'),

    invocation_expression: ($) =>
      prec.left(4, seq(
        $._expression,
        '->',
        $.name,
        choice(
          seq('(', optional($._argument_list), ')'),
          seq('{', repeat($._select_body_member), '}'),
        ),
      )),

    function_call_expression: ($) =>
      prec.left(4, choice(
        seq($.qualified_name, '(', optional($._argument_list), ')'),
        seq($.feature_chain_expression, '(', optional($._argument_list), ')'),
      )),

    _argument_list: ($) =>
      seq($._argument, repeat(seq(',', $._argument))),

    _argument: ($) =>
      choice(
        $.named_argument,
        seq($.port_direction, $._expression),
        $._expression,
      ),

    named_argument: ($) =>
      seq($.name, '=', $._expression),

    metadata_access_expression: ($) =>
      seq('@', $.qualified_name),

    meta_expression: ($) =>
      prec.left(1, seq($._expression, 'meta', $.qualified_name)),

    parenthesized_expression: ($) => prec(2, seq('(', $._expression, ')')),

    collection_expression: ($) =>
      prec(1, choice(
        seq('(', optional(seq($._expression, repeat(seq(',', $._expression)))), ')'),
        seq('{', $._expression, repeat(seq(',', $._expression)), '}'),
      )),

    binary_expression: ($) =>
      prec.left(
        1,
        seq(
          $._expression,
          choice(
            '+', '-', '*', '/', '%', '**', '^',
            '==', '!=', '<', '>', '<=', '>=',
            'and', 'or', 'xor', 'implies',
            '&&', '||',
            '??', '&', '|',
            '=',
            'istype', 'hastype',
          ),
          $._expression,
        ),
      ),

    unary_expression: ($) =>
      prec.right(
        2,
        seq(choice('-', 'not', '~'), $._expression),
      ),

    feature_chain_expression: ($) =>
      prec.left(3, seq($._expression, '.', $.name)),

    cast_expression: ($) =>
      prec.left(2, seq($._expression, 'as', $.qualified_name)),

    // =========================================================================
    // Literals
    // =========================================================================
    literal: ($) =>
      choice(
        $.integer_literal,
        $.real_literal,
        $.string_literal,
        $.boolean_literal,
        $.null_literal,
      ),

    integer_literal: ($) => /\d+/,

    real_literal: ($) => choice(
      /\d+\.\d+([eE][+-]?\d+)?/,
      /\.\d+([eE][+-]?\d+)?/,
      /\d+[eE][+-]?\d+/,
    ),

    string_literal: ($) => /"([^"\\]|\\.)*"/,

    boolean_literal: ($) => choice('true', 'false'),

    null_literal: ($) => 'null',

    // =========================================================================
    // Names
    // =========================================================================
    qualified_name: ($) =>
      prec.left(seq($.name, repeat(seq('::', $.name)))),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // =========================================================================
    // Comments (lexical)
    // =========================================================================
    comment: ($) =>
      token(
        choice(
          seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
          seq('//', /\*[^*]*\*+([^/*][^*]*\*+)*\//),
          seq('//', /[^*\n].*/),
          seq('//'),
        ),
      ),
  },
});

/**
 * Creates a comma-separated list of one or more elements.
 *
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

/**
 * Creates an optional comma-separated list.
 *
 * @param {RuleOrLiteral} rule
 */
function _commaSep(rule) { // eslint-disable-line no-unused-vars
  return optional(commaSep1(rule));
}
