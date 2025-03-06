import globalContext from '../..';

export function ethereumChainInteractions(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            Ethereum Chain Interactions
          </h4>
          <div class="form-group mb-3">
            <label for="chainIdInput">Chain ID (hex or decimal)</label>
            <input
              type="text"
              class="form-control"
              id="chainIdInput"
              placeholder="例如: 0x1 或 1"
              value="0x53a"
            >
          </div>
          <div class="mb-3">
            <label>常用网络:</label>
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-secondary" data-chainid="0x1">Mainnet</button>
              <button class="btn btn-secondary" data-chainid="0xaa36a7">Sepolia</button>
              <button class="btn btn-secondary" data-chainid="0x89">Polygon</button>
              <button class="btn btn-secondary" data-chainid="0xa4ec">Celo</button>
            </div>
          </div>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="addEthereumChain"
            disabled
          >
            添加网络
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="switchEthereumChain"
            disabled
          >
            切换网络
          </button>
        </div>
      </div>
    </div>`,
  );

  // 在原有内容后添加 Token 卡片
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">添加Token</h4>
          <div class="form-group mb-3">
            <input
              type="text"
              class="form-control mb-2"
              id="tokenAddress"
              placeholder="合约地址"
            >
            <input
              type="text"
              class="form-control mb-2"
              id="tokenSymbol"
              placeholder="Token符号"
            >
            <input
              type="number"
              class="form-control mb-2"
              id="tokenDecimals"
              placeholder="精度 (0-18)"
            >
            <input
              type="text"
              class="form-control mb-2"
              id="tokenImage"
              placeholder="Token图标URL"
            >
            <button
              class="btn btn-primary btn-lg btn-block"
              id="addToken"
            >
              添加Token
            </button>
          </div>
        </div>
      </div>
    </div>`,
  );

  const addEthereumChain = document.getElementById('addEthereumChain');
  const switchEthereumChain = document.getElementById('switchEthereumChain');
  const chainIdInput = document.getElementById('chainIdInput');

  // 启用快捷网络选择
  document.querySelectorAll('[data-chainid]').forEach((button) => {
    button.addEventListener('click', () => {
      chainIdInput.value = button.dataset.chainid;
    });
  });

  document.addEventListener('MetaMaskInstalled', function () {
    addEthereumChain.disabled = false;
    switchEthereumChain.disabled = false;
  });

  // 验证和转换 chainId
  function validateAndFormatChainId(input) {
    let chainId = input.trim();

    // 如果是十进制数字，转换为十六进制
    if (/^\d+$/u.test(chainId)) {
      chainId = `0x${Number(chainId).toString(16)}`;
    }

    // 验证十六进制格式
    if (!/^0x[0-9a-fA-F]+$/u.test(chainId)) {
      throw new Error('无效的 Chain ID 格式');
    }

    return chainId;
  }

  // 根据 chainId 获取网络配置
  function getNetworkParams(chainId) {
    const networkParams = {
      chainId,
      rpcUrls: [`http://127.0.0.1:${8545 + (parseInt(chainId, 16) % 100)}`],
      chainName: `Network ${chainId}`,
      nativeCurrency: { name: 'TEST', decimals: 18, symbol: 'TEST' },
      blockExplorerUrls: null,
    };

    // 为一些知名网络设置特定参数
    const knownNetworks = {
      '0x1': {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        rpcUrls: [
          'https://eth.llamarpc.com',
          'https://rpc.ankr.com/eth',
          'https://ethereum.publicnode.com',
        ],
        nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
        blockExplorerUrls: ['https://etherscan.io'],
      },
      '0xaa36a7': {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        rpcUrls: ['https://eth-sepolia.public.blastapi.io'],
        nativeCurrency: { name: 'Sepolia Ether', decimals: 18, symbol: 'ETH' },
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      '0x89': {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com'],
        nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
        blockExplorerUrls: ['https://polygonscan.com'],
      },
      // celo
      '0xa4ec': {
        chainId: '0xa4ec',
        chainName: 'Celo Mainnet',
        rpcUrls: ['https://rpc.celo.org'],
        nativeCurrency: { name: 'Celo', decimals: 18, symbol: 'CELO' },
        blockExplorerUrls: ['https://celoscan.io'],
      },
    };

    return knownNetworks[chainId] || networkParams;
  }

  // 添加一个用于显示消息的函数
  function showMessage(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // 找到要插入消息的位置
    const targetCard = document.querySelector('.card-body');
    targetCard.insertBefore(alertDiv, targetCard.firstChild);

    // 3秒后自动消失
    setTimeout(() => alertDiv.remove(), 3000);
  }

  // 修改原有的错误处理
  addEthereumChain.onclick = async () => {
    try {
      const chainId = validateAndFormatChainId(chainIdInput.value);
      const params = getNetworkParams(chainId);

      await globalContext.provider.request({
        method: 'wallet_addEthereumChain',
        params: [params],
      });
    } catch (error) {
      showMessage(error.message, 'danger');
    }
  };

  switchEthereumChain.onclick = async () => {
    try {
      const chainId = validateAndFormatChainId(chainIdInput.value);

      await globalContext.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      showMessage(error.message, 'danger');
    }
  };

  // 添加Token的功能
  const addTokenButton = document.getElementById('addToken');
  addTokenButton.onclick = async () => {
    try {
      const tokenAddress = document.getElementById('tokenAddress').value;
      const tokenSymbol = document.getElementById('tokenSymbol').value;
      const tokenDecimals = document.getElementById('tokenDecimals').value;
      const tokenImage = document.getElementById('tokenImage').value;

      const wasAdded = await globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: parseInt(tokenDecimals, 10),
            image: tokenImage,
          },
        },
      });

      if (wasAdded) {
        showMessage('Token添加成功！');
      }
    } catch (error) {
      showMessage(error.message, 'danger');
    }
  };
}
