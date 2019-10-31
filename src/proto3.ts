type Proto3Node = Proto3 | Proto3Content;

// TODO
export function traverseProto3(def: Proto3Node, func: (def: Proto3Node) => void) {

}

export interface Proto3 {
    syntax: 'proto3';
    content: Proto3Content[];
}

export type Proto3Content = (
    | PackageDefinition
    | ImportDefinition
    | ServiceDefinition
    | MessageDefinition
    | FieldDefinition
    | OptionDefinition
    | EnumDefinition
    | EnumFieldDefinition
    | RpcDefinition
)

export type MessageContent = (
    | MessageDefinition
    | FieldDefinition
    | EnumDefinition
)

export type PrimitiveIntegerType = (
    | 'int32'
    | 'int64'
    | 'uint32'
    | 'uint64'
    | 'sint32'
    | 'sint64'
    | 'fixed32'
    | 'fixed64'
    | 'sfixed32'
    | 'sfixed64'
)

export type PrimitiveType = (
    | PrimitiveIntegerType
    | 'double'
    | 'float'
    | 'bool'
    | 'string'
    | 'bytes'
)

export interface PackageDefinition {
    type: 'package';
    package: string;
}

export interface ImportDefinition {
    type: 'import';
    package: string;
    modifier: null;
}

export interface ServiceDefinition {
    type: 'service';
    name: string;
    content: RpcDefinition[];
}


export interface MessageDefinition {
    type: 'message';
    name: string;
    content: MessageContent[];
}

export interface OptionDefinition {
    type: 'option';
    name: string;
    val: string;
}

export interface EnumDefinition {
    type: 'enum';
    name: string;
    content: EnumFieldDefinition[];
}

export interface EnumFieldDefinition {
    type: 'enumField';
    name: string;
    val: number;
    opts: {};
}

export interface PrimitiveTypeDefinition {
    typename: PrimitiveType;
}

export interface MapTypeDefinition {
    typename: 'map';
    key: PrimitiveIntegerType | 'string' | 'bool';
    val: PrimitiveType;
}

export interface UserTypeDefinition {
    typename: string;
}

export type FieldDefinition = {
    type: 'field';
    name: string;
    repeated: boolean;
    fieldNo: number;
    opts: {};
} & (
    | PrimitiveTypeDefinition
    | MapTypeDefinition
    | UserTypeDefinition
)

export interface RpcDefinition {
    type: 'rpc';
    name: string;
    param: any;
    returns: any;
}
