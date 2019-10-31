import { GatsbyNode, Node } from 'gatsby';

// @ts-ignore
import parseProto from 'proto-parse';
import { Proto3, PackageDefinition, MessageDefinition, Proto3Content } from './proto3';

type NodeID = string;
type Maybe<T> = T | null | undefined;

interface Proto3PackageNode extends Node {
    name: string;
    messages___NODE?: NodeID[];
    services___NODE?: NodeID[];
}

interface Proto3MessageNode extends Node {
    name: string;
    package___NODE?: NodeID;
}

interface Proto3ServiceNode extends Node {
    name: string;
    package___NODE?: NodeID;
    rpcs___NODE?: NodeID[];
}

interface Proto3RpcNode extends Node {
    name: string;
    package___NODE?: NodeID;
    service___NODE?: NodeID;
}

export const onCreateNode: GatsbyNode['onCreateNode'] = async ({
    node,
    loadNodeContent,
    createNodeId,
    createContentDigest,
    actions: {
        touchNode,
        deleteNode,
        createNode,
        createParentChildLink,
    },
}) => {
    function touchAndGetNode<T extends Node>(node: T) {
        touchNode({ nodeId: node.id })
        return node;
    }

    function forceCreateNode<T extends Node>(node: T) {
        deleteNode({ node });
        createNode(node);
    }

    function transform<T>(type: string, content: T): T & Node {
        return {
            id: createNodeId(`${node.id} >>> Proto3${type}`),
            parent: node.id,
            children: [],
            internal: {
                type: `Proto3${type}`,
                contentDigest: createContentDigest(content),
                owner: '',
            },
            ...content,
        };
    }

    // FIXME: Replace condition to be based on MIME type
    // if (node.internal.mediaType !== 'application/protobuf') {
    if (!(node.internal.description && /^File ".*\.proto"$/.test(node.internal.description))) {
        return;
    }

    // Parse
    const content = await loadNodeContent(node);
    const proto: Maybe<Proto3> = parseProto(content);
    if (!(proto && proto.syntax === 'proto3')) {
        return;
    }

    const packageDef = (
        proto.content.find(def => def.type === 'package')
    ) as Maybe<PackageDefinition>;

    const packageNode: Maybe<Proto3PackageNode> = packageDef && touchAndGetNode(
        transform('Package', {
            name: packageDef.package,
        })
    );

    const messageNodes = proto.content
        .filter(def => def.type === 'message')
        .map(def => def as MessageDefinition)
        .map(def => transform('Message', {
            name: def.name,
        }))
        .map(touchAndGetNode);

    // Create & Link Nodes
    if (packageNode) {
        forceCreateNode({
            ...packageNode,
            messages___NODE: messageNodes.map(n => n.id),
        });
        createParentChildLink({ parent: node, child: packageNode });
    }
    messageNodes.forEach(messageNode => {
        forceCreateNode({
            ...messageNode,
            ...packageNode && { package___NODE: packageNode.id },
        });
        createParentChildLink({ parent: node, child: messageNode });
    });
};
